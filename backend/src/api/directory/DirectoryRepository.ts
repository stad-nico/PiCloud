/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { EntityManager } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';

import { DirectoryGetMetadataDBResult, IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { DirectoryContentResponse } from 'src/api/directory/mapping/content';
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
	public async insert(entityManager: EntityManager, name: string, parentId: string) {
		await entityManager
			.getKnex()
			.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId) VALUES (:name, :parentId)`, { name: name, parentId: parentId })
			.transacting(entityManager.getTransactionContext()!);
	}

	public async exists(entityManager: EntityManager, path: string): Promise<boolean> {
		const [rows] = await entityManager
			.getKnex()
			.raw<[Pick<Additional, 'count'>[]]>(
				// prettier-ignore
				`SELECT COUNT(*) as count FROM ${DIRECTORY_TABLE_NAME} WHERE id = GET_DIRECTORY_UUID(:path) LIMIT 1`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		return rows![0]!.count > 0;
	}

	public async select(entityManager: EntityManager, path: string): Promise<Pick<Directory, 'id' | 'name'> | null> {
		const [rows] = await entityManager
			.getKnex()
			.raw<[Pick<Directory, 'id' | 'name'>[]]>(
				// prettier-ignore
				`SELECT name, id FROM ${DIRECTORY_TABLE_NAME} WHERE id = GET_DIRECTORY_UUID(:path)`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		return rows![0] ?? null;
	}

	public async getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult | null> {
		const [rows] = await entityManager
			.getKnex()
			.raw<[Pick<Directory & Additional, 'name' | 'size' | 'files' | 'directories' | 'createdAt' | 'updatedAt'>[]]>(
				`WITH filesAmt AS (
				 	 SELECT COUNT(*) as filesAmt
				     FROM ${FILES_TABLE_NAME}
					 WHERE parentId IN (
						 SELECT childId
						 FROM ${TREE_TABLE_NAME}
						 WHERE parentId = GET_DIRECTORY_UUID(:path)
					 )
				  ),
				  directoriesAmt AS (
					 SELECT COUNT(*) - 1 as directoriesAmt
					 FROM ${DIRECTORY_TABLE_NAME}
					 WHERE id IN (
						 SELECT childId
						 FROM ${TREE_TABLE_NAME}
						 WHERE parentId = GET_DIRECTORY_UUID(:path)
					 )
				 )
				 SELECT name, GET_DIRECTORY_SIZE(id) AS size, 
			    	    filesAmt as files, directoriesAmt as directories, createdAt, updatedAt
				 FROM ${DIRECTORY_TABLE_NAME}
				 INNER JOIN filesAmt
				 INNER JOIN directoriesAmt
				 WHERE id = GET_DIRECTORY_UUID(:path)
				`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const metadata = rows![0];

		if (!metadata) {
			return null;
		}

		return {
			...metadata,
			createdAt: new Date(Date.parse(metadata.createdAt as unknown as string)),
			updatedAt: new Date(Date.parse(metadata.updatedAt as unknown as string)),
		};
	}

	public async getContent(entityManager: EntityManager, path: string): Promise<DirectoryContentResponse> {
		const [files] = await entityManager
			.getKnex()
			.raw<[(Pick<File, 'name' | 'mimeType' | 'size'> & { createdAt: string; updatedAt: string })[]]>(
				// prettier-ignore
				`SELECT name, mimeType, size, createdAt, updatedAt FROM ${FILES_TABLE_NAME} WHERE parentId = GET_DIRECTORY_UUID(:path)`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const [directories] = await entityManager
			.getKnex()
			.raw<[(Pick<Directory & Additional, 'name' | 'size'> & { createdAt: string; updatedAt: string })[]]>(
				`SELECT name, GET_DIRECTORY_SIZE(id) AS size, createdAt, updatedAt
				 FROM ${DIRECTORY_TABLE_NAME}
				 WHERE parentId = GET_DIRECTORY_UUID(:path)
				`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		return {
			files: files!,
			directories: directories!,
		};
	}

	public async getFilesRelative(entityManager: EntityManager, path: string): Promise<Array<Pick<File, 'id'> & { path: string }>> {
		const [files] = await entityManager
			.getKnex()
			.raw<[Pick<File & Additional, 'id' | 'path'>[]]>(
				`SELECT id, GET_FILE_PATH(id) AS path
				 FROM ${FILES_TABLE_NAME}
				 WHERE parentId IN (
					 SELECT childId
					 FROM ${TREE_TABLE_NAME}
					 INNER JOIN ${DIRECTORY_TABLE_NAME} ON ${TREE_TABLE_NAME}.childId = ${DIRECTORY_TABLE_NAME}.id
					 WHERE ${TREE_TABLE_NAME}.parentId = GET_DIRECTORY_UUID(:path)
				 )
				`,
				{ path: PathUtils.normalizeDirectoryPath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		const mapped = files!.map((file) => ({
			...file,
			path: PathUtils.normalizeFilePath(file.path.replace(path, '')),
		}));

		return mapped;
	}

	public async update(entityManager: EntityManager, path: string, partial: { name?: string; parentId?: string }): Promise<void> {
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

	public async delete(entityManager: EntityManager, rootId: string): Promise<void> {
		await entityManager
			.getKnex()
			.raw(`DELETE FROM ${DIRECTORY_TABLE_NAME} WHERE id = :rootId`, { rootId: rootId })
			.transacting(entityManager.getTransactionContext()!);
	}
}
