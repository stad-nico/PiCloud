import { EntityManager } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';

import { DirectoryGetContentDBResult, DirectoryGetMetadataDBResult, IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { Directory } from 'src/db/entities/Directory';
import { File } from 'src/db/entities/File';

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
		const output = [];

		for (const entity of entities) {
			for (const requiredKey of requiredKeys) {
				if (!(requiredKey in entity)) {
					continue;
				}
			}

			output.push(entity as Pick<Directory & Additional, T[number]>);
		}

		return output;
	}

	public async selectByPath(
		entityManager: EntityManager,
		path: string,
		isRecycled: boolean = false
	): Promise<Pick<Directory, 'id' | 'name'> | null> {
		const result = await entityManager.getKnex().raw<[{ id: string; name: string }[]]>(
			`SELECT name, id 
			FROM directories 
			WHERE is_recycled = :isRecycled AND id = GET_DIRECTORY_UUID(:path)`,
			{ isRecycled: isRecycled, path: path }
		);

		return this.validate(result[0] ?? [], ['id', 'name'])[0] ?? null;
	}

	public async selectById(entityManager: EntityManager, id: string, isRecycled: boolean = false): Promise<{ path: string } | null> {
		const result = await entityManager.getKnex().raw<[{ path: string }[]]>(
			`SELECT GET_DIRECTORY_PATH(id) as path
			FROM directories
			WHERE is_recycled = :isRecycled AND id = :id`,
			{ isRecycled: isRecycled, id: id }
		);

		return this.validate(result[0] ?? [], ['path'])[0] ?? null;
	}

	public async exists(entityManager: EntityManager, path: string, isRecycled: boolean = false): Promise<boolean> {
		const result = await entityManager.getKnex().raw<[{ count: number }[]]>(
			`SELECT COUNT(*) as count
			FROM directories
			WHERE is_recycled = :isRecycled AND id = GET_DIRECTORY_UUID(:path)
			LIMIT 1`,
			{ isRecycled: isRecycled, path: path }
		);

		const count = this.validate(result[0] ?? [], ['count'])[0]?.count ?? 0;

		return count > 0;
	}

	public async insert(entityManager: EntityManager, name: string, parentId: string | null = null) {
		await entityManager.getKnex().raw(
			`INSERT INTO directories (name, parent_id)
			VALUES (:name, :parentId)`,
			{ name: name, parentId: parentId }
		);
	}

	public async softDelete(entityManager: EntityManager, rootId: string): Promise<void> {
		await entityManager.getKnex().raw(
			`UPDATE directories
			SET is_recycled = true
			WHERE id IN (
				SELECT child_id
				FROM tree
				INNER JOIN directories ON tree.child_id = directories.id
				WHERE tree.parent_id = :rootId
			);
			
			UPDATE files
			SET is_recycled = true
			WHERE parent_id IN (
				SELECT child_id
				FROM tree
				INNER JOIN directories ON tree.child_id = directories.id
				WHERE tree.parent_id = :rootId
			);`,
			{ rootId: rootId }
		);
	}

	public async getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult | null> {
		const result = await entityManager
			.getKnex()
			.raw<[Pick<Directory & Additional, 'id' | 'name' | 'size' | 'files' | 'directories' | 'createdAt' | 'updatedAt'>[]]>(
				`WITH f_amt AS (
					SELECT COUNT(*) as f_amt
					FROM files
					WHERE files.is_recycled = false AND files.parent_id IN (
						SELECT child_id
						FROM tree
						WHERE tree.parent_id = GET_DIRECTORY_UUID(:path)
					)
				),
				d_amt AS (
					SELECT COUNT(*) - 1 as d_amt
					FROM directories
					WHERE directories.is_recycled = false AND directories.parent_id IN (
						SELECT child_id
						FROM tree
						WHERE tree.parent_id = GET_DIRECTORY_UUID(:path)
					)
				)
				SELECT id, name, GET_DIRECTORY_SIZE(GET_DIRECTORY_PATH(id)) AS size, 
			    	   f_amt as files, d_amt as directories, created_at, updated_at
				FROM directories
				INNER JOIN f_amt
				INNER JOIN d_amt
				WHERE is_recycled = false AND id = GET_DIRECTORY_UUID(:path)`,
				{ path: path }
			);

		const mapped = (result[0] ?? []).map((x) => entityManager.map(Directory, x));

		return this.validate(mapped, ['id', 'name', 'size', 'files', 'directories', 'createdAt', 'updatedAt'])[0] ?? null;
	}

	public async getContent(entityManager: EntityManager, path: string): Promise<DirectoryGetContentDBResult | null> {
		const files = await entityManager.getKnex().raw<[Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'>[]]>(
			`SELECT id, name, mime_type, size, created_at, updated_at
			FROM files
			WHERE is_recycled = false AND parent_id = GET_DIRECTORY_UUID(:path)`,
			{ path: path }
		);

		const mappedFiles = (files[0] ?? []).map((file) => entityManager.map(File, file));

		const directories = await entityManager
			.getKnex()
			.raw<[Pick<Directory & Additional, 'id' | 'name' | 'size' | 'createdAt' | 'updatedAt'>[]]>(
				`SELECT id, name, GET_DIRECTORY_SIZE(id) AS size, created_at, updated_at
				FROM directories
				WHERE is_recycled = false AND parent_id = GET_DIRECTORY_UUID(:path)`,
				{ path: path }
			);

		const mappedDirectories = this.validate(
			(directories[0] ?? []).map((x) => entityManager.map(Directory, x)),
			['id', 'name', 'size', 'createdAt', 'updatedAt']
		);

		return { files: mappedFiles, directories: mappedDirectories };
	}

	public async getFilesRelative(entityManager: EntityManager, path: string): Promise<Array<Pick<File, 'id'> & { path: string }>> {
		const result = await entityManager.getKnex().raw<[{ id: string; path: string }[]]>(
			`SELECT id, GET_FILE_PATH(id) AS path
			FROM files
			WHERE is_recycled = false AND parent_id IN (
				SELECT child_id
				FROM tree
				INNER JOIN directories ON tree.child_id = directories.id
				WHERE tree.parent_id = GET_DIRECTORY_UUID(:path)
			)`,
			{ path: path }
		);

		const files = this.validate(result[0] ?? [], ['id', 'path']);

		return files.map((file) => ({ id: file.id, path: file.path.replace(path, '') }));
	}

	public async update(entityManager: EntityManager, path: string, partial: Partial<Directory>): Promise<void> {
		await entityManager.createQueryBuilder(Directory, 'directories').update(partial).where('id = GET_DIRECTORY_UUID(?)', [path]);
	}

	public async restore(entityManager: EntityManager, rootId: string): Promise<void> {
		await entityManager.getKnex().raw(
			`UPDATE directories
			SET is_recycled = false
			WHERE id IN (
				SELECT child_id
				FROM tree
				INNER JOIN directories ON tree.child_id = directories.id
				WHERE tree.parent_id = :rootId
			);
			
			UPDATE files
			SET is_recycled = false
			WHERE parent_id IN (
				SELECT child_id
				FROM tree
				INNER JOIN directories ON tree.child_id = directories.id
				WHERE tree.parent_id = :rootId
			);`,
			{ rootId: rootId }
		);
	}
}
