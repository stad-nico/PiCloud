/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { EntityRepository } from '@mikro-orm/mariadb';

import { DIRECTORY_TABLE_NAME, Directory } from 'src/db/entities/directory.entity';
import { FILES_TABLE_NAME, File } from 'src/db/entities/file.entity';
import { TREE_TABLE_NAME } from 'src/db/entities/tree.entity';

type Additional = {
	path: string;
	count: number;
	size: number;
	directories: number;
	files: number;
	mimeType: string;
	parentId: string;
	userId: string;
};

export type DirectoryGetMetadataDBResult = Pick<Directory, 'name' | 'createdAt' | 'updatedAt'> & {
	parentId: string;
	size: number;
	files: number;
	directories: number;
};

export type DirectoryGetContentsDBResult = {
	files: Array<Pick<File, 'id' | 'name' | 'mimeType' | 'createdAt' | 'updatedAt' | 'size'>>;
	directories: Array<
		Pick<Directory, 'id' | 'name' | 'createdAt' | 'updatedAt'> & {
			size: number;
			files: number;
			directories: number;
		}
	>;
};

export type DirectoryRecursiveContentResponse = {
	files: Array<{ id: string; name: string; parentId: string }>;
	directories: Array<{ id: string; name: string; parentId: string | null }>;
};

export class DirectoriesRepository extends EntityRepository<Directory> {
	public async getContents(directoryId: string, userId: string): Promise<DirectoryGetContentsDBResult> {
		const entityManager = this.getEntityManager();
		const fileQuery = `SELECT id, name, mimeType, size, createdAt, updatedAt FROM ${FILES_TABLE_NAME} WHERE parentId = :parentId AND userId = :userId`;
		const fileParams = { parentId: directoryId, userId: userId };

		const [files] = await entityManager
			.getKnex()
			.raw<
				[(Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string })[]]
			>(fileQuery, fileParams)
			.transacting(entityManager.getTransactionContext()!);

		const childQuery = `SELECT childId FROM ${TREE_TABLE_NAME} WHERE parentId = d.id`;
		const filesQuery = `SELECT COUNT(*) as filesAmt FROM ${FILES_TABLE_NAME} WHERE parentId IN (${childQuery})`;
		const directoriesQuery = `SELECT COUNT(*) - 1 FROM ${DIRECTORY_TABLE_NAME} WHERE id IN (${childQuery})`;
		const sizeQuery = `SELECT COALESCE(SUM(size), 0) FROM ${FILES_TABLE_NAME} WHERE parentId IN (${childQuery})`;

		const query = `SELECT id, name, updatedAt, createdAt, (${sizeQuery}) AS size, (${filesQuery}) AS files, (${directoriesQuery}) AS directories FROM ${DIRECTORY_TABLE_NAME} d WHERE parentId = :id AND userId = :userId`;
		const params = { id: directoryId, userId: userId };

		const [directories] = await entityManager
			.getKnex()
			.raw<[Pick<Directory & Additional, 'id' | 'name' | 'size' | 'files' | 'directories' | 'createdAt' | 'updatedAt'>[]]>(query, params)
			.transacting(entityManager.getTransactionContext()!);

		return {
			files:
				files?.map((file) => ({
					...file,
					createdAt: new Date(Date.parse(file.createdAt as unknown as string)),
					updatedAt: new Date(Date.parse(file.updatedAt as unknown as string)),
				})) ?? [],
			directories:
				directories?.map((directory) => ({
					...directory,
					createdAt: new Date(Date.parse(directory.createdAt as unknown as string)),
					updatedAt: new Date(Date.parse(directory.updatedAt as unknown as string)),
				})) ?? [],
		};
	}

	public async getMetadata(directoryId: string, userId: string): Promise<DirectoryGetMetadataDBResult | null> {
		const entityManager = this.getEntityManager();
		const childQuery = `SELECT childId FROM ${TREE_TABLE_NAME} WHERE parentId = :id`;
		const filesAmtQuery = `SELECT COUNT(*) as filesAmt FROM ${FILES_TABLE_NAME} WHERE parentId IN (${childQuery})`;
		const directoriesAmtQuery = `SELECT COUNT(*) - 1 as directoriesAmt FROM ${DIRECTORY_TABLE_NAME} WHERE id IN (${childQuery})`;
		const sizeQuery = `SELECT COALESCE(SUM(size), 0) as _size FROM ${FILES_TABLE_NAME} WHERE parentId IN (${childQuery})`;

		const selectQuery = `name, parentId, _size as size, filesAmt as files, directoriesAmt as directories, createdAt, updatedAt`;

		const query = `WITH filesAmt AS (${filesAmtQuery}), directoriesAmt AS (${directoriesAmtQuery}), _size AS (${sizeQuery}) SELECT ${selectQuery} FROM ${DIRECTORY_TABLE_NAME} INNER JOIN filesAmt INNER JOIN directoriesAmt INNER JOIN _size WHERE id = :id AND userId = :userId`;
		const params = { id: directoryId, userId: userId };

		const [rows] = await entityManager
			.getKnex()
			.raw<[Pick<Directory & Additional, 'name' | 'size' | 'files' | 'directories' | 'createdAt' | 'updatedAt' | 'parentId'>[]]>(query, params)
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

	public async getContentsRecursive(id: string): Promise<DirectoryRecursiveContentResponse> {
		const entityManager = this.getEntityManager();
		const childQuery = `SELECT childId FROM ${TREE_TABLE_NAME} WHERE parentId = :id`;
		const params = { id: id };

		const filesQuery = `SELECT id, name, parentId FROM ${FILES_TABLE_NAME} WHERE parentId IN (${childQuery})`;

		const [files] = await entityManager
			.getKnex()
			.raw<[Array<Pick<File, 'id' | 'name'> & { parentId: string }>]>(filesQuery, params)
			.transacting(entityManager.getTransactionContext()!);

		const directoriesQuery = `SELECT id, name, parentId FROM ${DIRECTORY_TABLE_NAME} WHERE id IN (${childQuery})`;

		const [directories] = await entityManager
			.getKnex()
			.raw<[Array<Pick<File, 'id' | 'name'> & { parentId: string }>]>(directoriesQuery, params)
			.transacting(entityManager.getTransactionContext()!);

		return {
			files: files ?? [],
			directories: directories ?? [],
		};
	}
}
