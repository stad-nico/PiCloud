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
	mimeType: string;
};

@Injectable()
export class DirectoryRepository implements IDirectoryRepository {
	public async selectByPath(entityManager: EntityManager, path: string, isRecycled: boolean): Promise<Pick<Directory, 'id' | 'name'> | null> {
		const result = await entityManager
			.getKnex()
			.raw<[Pick<Directory, 'id' | 'name'>[]]>(
				// prettier-ignore
				`SELECT name, id FROM ${DIRECTORY_TABLE_NAME} WHERE isRecycled = :isRecycled AND id = GET_DIRECTORY_UUID(:path)`,
				{ isRecycled: isRecycled, path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		return result[0]![0] ?? null;
	}

	public async selectById(entityManager: EntityManager, id: string): Promise<{ path: string; isRecycled: boolean } | null> {
		const result = await entityManager
			.getKnex()
			.raw<[Pick<Directory & Additional, 'path' | 'isRecycled'>[]]>(
				// prettier-ignore
				`SELECT isRecycled, GET_DIRECTORY_PATH(id) as path FROM ${DIRECTORY_TABLE_NAME} WHERE id = :id`,
				{ id: id }
			)
			.transacting(entityManager.getTransactionContext()!);

		const directory = result[0]![0];

		if (!directory) {
			return null;
		}

		return {
			path: PathUtils.normalizeDirectoryPath(directory.path),
			isRecycled: Boolean(directory.isRecycled),
		};
	}

	public async exists(entityManager: EntityManager, path: string, isRecycled: boolean): Promise<boolean> {
		const result = await entityManager
			.getKnex()
			.raw<[Pick<Additional, 'count'>[]]>(
				// prettier-ignore
				`SELECT COUNT(*) as count FROM ${DIRECTORY_TABLE_NAME} WHERE isRecycled = :isRecycled AND id = GET_DIRECTORY_UUID(:path) LIMIT 1`,
				{ isRecycled: isRecycled, path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		return result[0]![0]!.count > 0;
	}

	public async insert(entityManager: EntityManager, name: string, parentId: string | null) {
		await entityManager
			.getKnex()
			.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId) VALUES (:name, :parentId)`, { name: name, parentId: parentId })
			.transacting(entityManager.getTransactionContext()!);
	}

	public async softDelete(entityManager: EntityManager, rootId: string): Promise<void> {
		await entityManager
			.getKnex()
			.raw(
				`UPDATE ${DIRECTORY_TABLE_NAME} 
				SET isRecycled = true 
				WHERE id IN (
					SELECT childId 
					FROM ${TREE_TABLE_NAME} 
					INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.childId = ${DIRECTORY_TABLE_NAME}.id 
					WHERE ${TREE_TABLE_NAME}.parentId = :rootId
				);

				UPDATE ${FILES_TABLE_NAME} 
				SET isRecycled = true 
				WHERE parentId IN (
					SELECT childId 
					FROM ${TREE_TABLE_NAME} 
					INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.childId = ${DIRECTORY_TABLE_NAME}.id 
					WHERE ${TREE_TABLE_NAME}.parentId = :rootId
				);`,
				{ rootId: rootId }
			)
			.transacting(entityManager.getTransactionContext()!);
	}

	public async getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult | null> {
		const result = await entityManager
			.getKnex()
			.raw<[Pick<Directory & Additional, 'id' | 'name' | 'size' | 'files' | 'directories' | 'createdAt' | 'updatedAt'>[]]>(
				`WITH filesAmt AS (
				 	 SELECT COUNT(*) as filesAmt
				     FROM ${FILES_TABLE_NAME}
					 WHERE isRecycled = false AND parentId IN (
						 SELECT childId
						 FROM ${TREE_TABLE_NAME}
						 WHERE parentId = GET_DIRECTORY_UUID(:path)
					 )
				  ),
				  directoriesAmt AS (
					 SELECT COUNT(*) - 1 as directoriesAmt
					 FROM ${DIRECTORY_TABLE_NAME}
					 WHERE isRecycled = false AND id IN (
						 SELECT childId
						 FROM ${TREE_TABLE_NAME}
						 WHERE parentId = GET_DIRECTORY_UUID(:path)
					 )
				 )
				 SELECT id, name, GET_DIRECTORY_SIZE(id) AS size, 
			    	    filesAmt as files, directoriesAmt as directories, createdAt, updatedAt
				 FROM ${DIRECTORY_TABLE_NAME}
				 INNER JOIN filesAmt
				 INNER JOIN directoriesAmt
				 WHERE isRecycled = false AND id = GET_DIRECTORY_UUID(:path)
				`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const metadata = result[0]![0];

		if (!metadata) {
			return null;
		}

		return {
			...metadata,
			createdAt: new Date(Date.parse(metadata?.createdAt as unknown as string)),
			updatedAt: new Date(Date.parse(metadata?.updatedAt as unknown as string)),
		};
	}

	public async getContent(entityManager: EntityManager, path: string): Promise<DirectoryGetContentDBResult> {
		const files = await entityManager
			.getKnex()
			.raw<[Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'>[]]>(
				// prettier-ignore
				`SELECT id, name, mimeType, size, createdAt, updatedAt FROM ${FILES_TABLE_NAME} WHERE isRecycled = false AND parentId = GET_DIRECTORY_UUID(:path)`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const mappedFiles = files[0]!.map((file) => ({
			...file,
			createdAt: new Date(Date.parse(file.createdAt as unknown as string)),
			updatedAt: new Date(Date.parse(file.updatedAt as unknown as string)),
		}));

		const directories = await entityManager
			.getKnex()
			.raw<[Pick<Directory & Additional, 'id' | 'name' | 'size' | 'createdAt' | 'updatedAt'>[]]>(
				`SELECT id, name, GET_DIRECTORY_SIZE(id) AS size, createdAt, updatedAt
				 FROM ${DIRECTORY_TABLE_NAME}
				 WHERE isRecycled = false AND parentId = GET_DIRECTORY_UUID(:path)
				`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const mappedDirectories = directories[0]!.map((directory) => ({
			...directory,
			createdAt: new Date(Date.parse(directory.createdAt as unknown as string)),
			updatedAt: new Date(Date.parse(directory.updatedAt as unknown as string)),
		}));

		return {
			files: mappedFiles,
			directories: mappedDirectories,
		};
	}

	public async getFilesRelative(entityManager: EntityManager, path: string): Promise<Array<Pick<File, 'id'> & { path: string }>> {
		const result = await entityManager
			.getKnex()
			.raw<[{ id: string; path: string }[]]>(
				`SELECT id, GET_FILE_PATH(id) AS path
				 FROM ${FILES_TABLE_NAME}
				 WHERE isRecycled = false AND parentId IN (
					 SELECT childId
					 FROM ${TREE_TABLE_NAME}
					 INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.childId = ${DIRECTORY_TABLE_NAME}.id
					 WHERE ${TREE_TABLE_NAME}.parentId = GET_DIRECTORY_UUID(:path)
				 )
				`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const mapped = result[0]!.map((file) => ({
			...file,
			path: PathUtils.normalizeFilePath(file.path.replace(path, '')),
		}));

		return mapped;
	}

	public async update(entityManager: EntityManager, path: string, partial: { name?: string; parentId?: string | null }): Promise<void> {
		if (Object.keys(partial).length === 0) {
			return;
		}

		await entityManager
			.getKnex()
			.table(DIRECTORY_TABLE_NAME)
			.update(partial)
			.whereRaw('id = GET_DIRECTORY_UUID(?)', [PathUtils.normalizeDirectoryPath(path)])
			.transacting(entityManager.getTransactionContext()!);
	}

	public async restore(entityManager: EntityManager, rootId: string): Promise<void> {
		await entityManager
			.getKnex()
			.raw(
				`UPDATE ${DIRECTORY_TABLE_NAME}
				 SET isRecycled = false
				 WHERE id IN (
					 SELECT childId
					 FROM ${TREE_TABLE_NAME}
					 INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.childId = ${DIRECTORY_TABLE_NAME}.id
					 WHERE ${TREE_TABLE_NAME}.parentId = :rootId
				 );
			
				 UPDATE ${FILES_TABLE_NAME}
				 SET isRecycled = false
				 WHERE parentId IN (
					 SELECT childId
					 FROM ${TREE_TABLE_NAME}
					 INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.childId = ${DIRECTORY_TABLE_NAME}.id
					 WHERE ${TREE_TABLE_NAME}.parentId = :rootId
				 );
				`,
				{ rootId: rootId }
			)
			.transacting(entityManager.getTransactionContext()!);
	}
}
