import { EntityManager } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';

import { DirectoryGetContentDBResult, DirectoryGetMetadataDBResult, IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { DIRECTORY_TABLE_NAME, Directory } from 'src/db/entities/Directory';
import { FILES_TABLE_NAME, File } from 'src/db/entities/File';
import { TREE_TABLE_NAME } from 'src/db/entities/Tree';
import { PathUtils } from 'src/util/PathUtils';

type Additional = {
	path: string;
	count: number;
	size: number;
	directories: number;
	files: number;
};

@Injectable()
export class DirectoryRepository implements IDirectoryRepository {
	private validate<T extends Array<keyof (Directory & Additional)>>(
		entities: Array<Partial<Directory & Additional>>,
		requiredKeys: T
	): Array<Pick<Directory & Additional, T[number]>> {
		if (requiredKeys.length === 0) {
			return entities as Array<Pick<Directory & Additional, T[number]>>;
		}

		const output = [];

		entityLoop: for (const entity of entities) {
			let object: { [key: string]: any } = {};

			for (const requiredKey of requiredKeys) {
				if (!(requiredKey in entity)) {
					continue entityLoop;
				}

				object[requiredKey as string] = entity[requiredKey];
			}

			output.push(object as Pick<Directory & Additional, T[number]>);
		}

		return output;
	}

	public async selectByPath(
		entityManager: EntityManager,
		path: string,
		isRecycled: boolean
	): Promise<Pick<Directory, 'id' | 'name'> | null> {
		const result = await entityManager
			.getKnex()
			.raw<[{ id: string; name: string }[]]>(
				// prettier-ignore
				`SELECT name, id FROM ${DIRECTORY_TABLE_NAME} WHERE is_recycled = :isRecycled AND id = GET_DIRECTORY_UUID(:path)`,
				{ isRecycled: isRecycled, path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		return this.validate(result[0] ?? [], ['id', 'name'])[0] ?? null;
	}

	public async selectById(entityManager: EntityManager, id: string): Promise<{ path: string; isRecycled: boolean } | null> {
		const result = await entityManager
			.getKnex()
			.raw<[{ is_recycled: number; path: string }[]]>(
				// prettier-ignore
				`SELECT is_recycled, GET_DIRECTORY_PATH(id) as path FROM ${DIRECTORY_TABLE_NAME} WHERE id = :id`,
				{ id: id }
			)
			.transacting(entityManager.getTransactionContext()!);

		const mapped = (result[0] ?? []).map((x) => {
			x.path = PathUtils.normalizeDirectoryPath(x.path);
			return entityManager.map(Directory, x);
		});

		return this.validate(mapped, ['path', 'isRecycled'])[0] ?? null;
	}

	public async exists(entityManager: EntityManager, path: string, isRecycled: boolean): Promise<boolean> {
		const result = await entityManager
			.getKnex()
			.raw<[{ count: number }[]]>(
				// prettier-ignore
				`SELECT COUNT(*) as count FROM ${DIRECTORY_TABLE_NAME} WHERE is_recycled = :isRecycled AND id = GET_DIRECTORY_UUID(:path) LIMIT 1`,
				{ isRecycled: isRecycled, path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const count = this.validate(result[0] ?? [], ['count'])[0]?.count ?? 0;

		return count > 0;
	}

	public async insert(entityManager: EntityManager, name: string, parentId: string | null) {
		await entityManager
			.getKnex()
			.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parent_id) VALUES (:name, :parentId)`, { name: name, parentId: parentId })
			.transacting(entityManager.getTransactionContext()!);
	}

	public async softDelete(entityManager: EntityManager, rootId: string): Promise<void> {
		await entityManager
			.getKnex()
			.raw(
				`UPDATE ${DIRECTORY_TABLE_NAME}
				 SET is_recycled = true
				 WHERE id IN (
				 	SELECT child_id
				 	FROM ${TREE_TABLE_NAME}
				 	INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.child_id = ${DIRECTORY_TABLE_NAME}.id
				 	WHERE ${TREE_TABLE_NAME}.parent_id = :rootId
				 );
			
				 UPDATE ${FILES_TABLE_NAME}
				 SET is_recycled = true
				 WHERE parent_id IN (
					 SELECT child_id
					 FROM ${TREE_TABLE_NAME}
					 INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.child_id = ${DIRECTORY_TABLE_NAME}.id
					 WHERE ${TREE_TABLE_NAME}.parent_id = :rootId
				 );
				`,
				{ rootId: rootId }
			)
			.transacting(entityManager.getTransactionContext()!);
	}

	public async getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult | null> {
		const result = await entityManager
			.getKnex()
			.raw<[Pick<Directory & Additional, 'id' | 'name' | 'size' | 'files' | 'directories' | 'createdAt' | 'updatedAt'>[]]>(
				`WITH f_amt AS (
				 	 SELECT COUNT(*) as f_amt
				     FROM ${FILES_TABLE_NAME}
					 WHERE ${FILES_TABLE_NAME}.is_recycled = false AND ${FILES_TABLE_NAME}.parent_id IN (
						 SELECT child_id
						 FROM ${TREE_TABLE_NAME}
						 WHERE ${TREE_TABLE_NAME}.parent_id = GET_DIRECTORY_UUID(:path)
					 )
				  ),
				  d_amt AS (
					 SELECT COUNT(*) - 1 as d_amt
					 FROM ${DIRECTORY_TABLE_NAME}
					 WHERE ${DIRECTORY_TABLE_NAME}.is_recycled = false AND ${DIRECTORY_TABLE_NAME}.parent_id IN (
						 SELECT child_id
						 FROM ${TREE_TABLE_NAME}
						 WHERE ${TREE_TABLE_NAME}.parent_id = GET_DIRECTORY_UUID(:path)
					 )
				 )
				 SELECT id, name, GET_DIRECTORY_SIZE(GET_DIRECTORY_PATH(id)) AS size, 
			    	    f_amt as files, d_amt as directories, created_at, updated_at
				 FROM ${DIRECTORY_TABLE_NAME}
				 INNER JOIN f_amt
				 INNER JOIN d_amt
				 WHERE is_recycled = false AND id = GET_DIRECTORY_UUID(:path)
				`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const mapped = (result[0] ?? []).map((x) => entityManager.map(Directory, x));

		return this.validate(mapped, ['id', 'name', 'size', 'files', 'directories', 'createdAt', 'updatedAt'])[0] ?? null;
	}

	public async getContent(entityManager: EntityManager, path: string): Promise<DirectoryGetContentDBResult | null> {
		const files = await entityManager
			.getKnex()
			.raw<[Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'>[]]>(
				// prettier-ignore
				`SELECT id, name, mime_type, size, created_at, updated_at FROM ${FILES_TABLE_NAME} WHERE is_recycled = false AND parent_id = GET_DIRECTORY_UUID(:path)`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const mappedFiles = (files[0] ?? []).map((file) => entityManager.map(File, file));

		const directories = await entityManager
			.getKnex()
			.raw<[Pick<Directory & Additional, 'id' | 'name' | 'size' | 'createdAt' | 'updatedAt'>[]]>(
				`SELECT id, name, GET_DIRECTORY_SIZE(id) AS size, created_at, updated_at
				 FROM ${DIRECTORY_TABLE_NAME}
				 WHERE is_recycled = false AND parent_id = GET_DIRECTORY_UUID(:path)
				`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const mappedDirectories = this.validate(
			(directories[0] ?? []).map((x) => entityManager.map(Directory, x)),
			['id', 'name', 'size', 'createdAt', 'updatedAt']
		);

		return { files: mappedFiles, directories: mappedDirectories };
	}

	public async getFilesRelative(entityManager: EntityManager, path: string): Promise<Array<Pick<File, 'id'> & { path: string }>> {
		const result = await entityManager
			.getKnex()
			.raw<[{ id: string; path: string }[]]>(
				`SELECT id, GET_FILE_PATH(id) AS path
				 FROM ${FILES_TABLE_NAME}
				 WHERE is_recycled = false AND parent_id IN (
					 SELECT child_id
					 FROM ${TREE_TABLE_NAME}
					 INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.child_id = ${DIRECTORY_TABLE_NAME}.id
					 WHERE ${TREE_TABLE_NAME}.parent_id = GET_DIRECTORY_UUID(:path)
				 )
				`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const files = this.validate(result[0] ?? [], ['id', 'path']);

		return files.map((file) => ({ id: file.id, path: PathUtils.normalizeFilePath(file.path.replace(path, '')) }));
	}

	public async update(entityManager: EntityManager, path: string, partial: Partial<Directory>): Promise<void> {
		await entityManager
			.createQueryBuilder(Directory, 'directories')
			.update(partial)
			.where('id = GET_DIRECTORY_UUID(?)', [PathUtils.normalizeDirectoryPath(path)]);
	}

	public async restore(entityManager: EntityManager, rootId: string): Promise<void> {
		await entityManager
			.getKnex()
			.raw(
				`UPDATE ${DIRECTORY_TABLE_NAME}
				 SET is_recycled = false
				 WHERE id IN (
					 SELECT child_id
					 FROM ${TREE_TABLE_NAME}
					 INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.child_id = ${DIRECTORY_TABLE_NAME}.id
					 WHERE ${TREE_TABLE_NAME}.parent_id = :rootId
				 );
			
				 UPDATE ${FILES_TABLE_NAME}
				 SET is_recycled = false
				 WHERE parent_id IN (
					 SELECT child_id
					 FROM ${TREE_TABLE_NAME}
					 INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.child_id = ${DIRECTORY_TABLE_NAME}.id
					 WHERE ${TREE_TABLE_NAME}.parent_id = :rootId
				 );
				`,
				{ rootId: rootId }
			)
			.transacting(entityManager.getTransactionContext()!);
	}
}
