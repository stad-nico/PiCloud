/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { EntityManager } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';

import { DirectoryGetMetadataDBResult, DirectoryRecursiveContentResponse, IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { DirectoryContentResponse } from 'src/api/directory/mapping/content';
import { DIRECTORY_TABLE_NAME, Directory } from 'src/db/entities/Directory';
import { FILES_TABLE_NAME, File } from 'src/db/entities/File';
import { TREE_TABLE_NAME } from 'src/db/entities/Tree';

type Additional = {
	path: string;
	count: number;
	size: number;
	directories: number;
	files: number;
	mimeType: string;
	parentId: string;
};

@Injectable()
export class DirectoryRepository implements IDirectoryRepository {
	public async insertReturningId(entityManager: EntityManager, parentId: string, name: string): Promise<string> {
		const query = `INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId) VALUES (:name, :parentId) RETURNING id`;
		const params = { name: name, parentId: parentId };

		const [rows] = await entityManager.getKnex().raw<[Pick<Directory, 'id'>[]]>(query, params).transacting(entityManager.getTransactionContext()!);

		return rows![0]!.id;
	}

	public async exists(entityManager: EntityManager, parentId: string, name: string): Promise<boolean>;
	public async exists(entityManager: EntityManager, id: string): Promise<boolean>;
	public async exists(entityManager: EntityManager, parentIdOrId: string, name?: string | undefined): Promise<boolean> {
		const query = name
			? `SELECT COUNT(*) as count FROM ${DIRECTORY_TABLE_NAME} WHERE parentId = :parentId AND name = :name LIMIT 1`
			: `SELECT COUNT(*) as count FROM ${DIRECTORY_TABLE_NAME} WHERE id = :id LIMIT 1`;

		const params = name ? { parentId: parentIdOrId, name: name } : { id: parentIdOrId };

		const [rows] = await entityManager.getKnex().raw<[Pick<Additional, 'count'>[]]>(query, params).transacting(entityManager.getTransactionContext()!);

		return rows![0]!.count > 0;
	}

	public async getName(entityManager: EntityManager, id: string): Promise<string | null> {
		const query = `SELECT name FROM ${DIRECTORY_TABLE_NAME} WHERE id = :id`;
		const params = { id: id };

		const [rows] = await entityManager.getKnex().raw<[Pick<Directory, 'name'>[]]>(query, params).transacting(entityManager.getTransactionContext()!);

		return rows![0]?.name ?? null;
	}

	public async getParentId(entityManager: EntityManager, id: string): Promise<string | null> {
		const query = `SELECT parentId FROM ${DIRECTORY_TABLE_NAME} WHERE id = :id`;
		const params = { id: id };

		const [rows] = await entityManager.getKnex().raw<[{ parentId: string }[]]>(query, params).transacting(entityManager.getTransactionContext()!);

		return rows![0]?.parentId ?? null;
	}

	public async getMetadata(entityManager: EntityManager, id: string): Promise<DirectoryGetMetadataDBResult | null> {
		const childQuery = `SELECT childId FROM ${TREE_TABLE_NAME} WHERE parentId = :id`;
		const filesAmtQuery = `SELECT COUNT(*) as filesAmt FROM ${FILES_TABLE_NAME} WHERE parentId IN (${childQuery})`;
		const directoriesAmtQuery = `SELECT COUNT(*) - 1 as directoriesAmt FROM ${DIRECTORY_TABLE_NAME} WHERE id IN (${childQuery})`;
		const sizeQuery = `SELECT COALESCE(SUM(size), 0) as _size FROM ${FILES_TABLE_NAME} WHERE parentId IN (${childQuery})`;

		const selectQuery = `name, parentId, _size as size, filesAmt as files, directoriesAmt as directories, createdAt, updatedAt`;

		const query = `WITH filesAmt AS (${filesAmtQuery}), directoriesAmt AS (${directoriesAmtQuery}), _size AS (${sizeQuery}) SELECT ${selectQuery} FROM ${DIRECTORY_TABLE_NAME} INNER JOIN filesAmt INNER JOIN directoriesAmt INNER JOIN _size WHERE id = :id`;
		const params = { id: id };

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

	public async getContents(entityManager: EntityManager, id: string): Promise<DirectoryContentResponse> {
		const fileQuery = `SELECT id, name FROM ${FILES_TABLE_NAME} WHERE parentId = :parentId`;
		const fileParams = { parentId: id };

		const [files] = await entityManager
			.getKnex()
			.raw<[(Pick<File, 'id' | 'name'> & { createdAt: string; updatedAt: string })[]]>(fileQuery, fileParams)
			.transacting(entityManager.getTransactionContext()!);

		const existsChildQuery = `SELECT 1 FROM directories WHERE parentId = d.id`;
		const hasChildrenQuery = `CASE WHEN EXISTS (${existsChildQuery}) THEN TRUE ELSE FALSE END`;

		const directoryQuery = `SELECT id, name, (${hasChildrenQuery}) AS hasChildren FROM ${DIRECTORY_TABLE_NAME} d WHERE parentId = :parentId`;
		const directoryParams = { parentId: id };

		const [directories] = await entityManager
			.getKnex()
			.raw<[(Pick<Directory, 'id' | 'name'> & { hasChildren: boolean })[]]>(directoryQuery, directoryParams)
			.transacting(entityManager.getTransactionContext()!);

		return {
			files: files ?? [],
			directories: directories ?? [],
		};
	}

	public async getContentsRecursive(entityManager: EntityManager, id: string): Promise<DirectoryRecursiveContentResponse> {
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

	public async update(entityManager: EntityManager, id: string, partial: { name?: string; parentId?: string }): Promise<void> {
		if (Object.keys(partial).length === 0) {
			return;
		}

		await entityManager.getKnex().table(DIRECTORY_TABLE_NAME).update(partial).where('id', id).transacting(entityManager.getTransactionContext()!);
	}

	public async delete(entityManager: EntityManager, rootId: string): Promise<void> {
		await entityManager
			.getKnex()
			.raw(`DELETE FROM ${DIRECTORY_TABLE_NAME} WHERE id = :rootId`, { rootId: rootId })
			.transacting(entityManager.getTransactionContext()!);
	}
}
