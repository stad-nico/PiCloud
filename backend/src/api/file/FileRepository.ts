/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { EntityManager } from '@mikro-orm/mariadb';

import { IFileRepository } from 'src/api/file/IFileRepository';
import { FILES_TABLE_NAME, File } from 'src/db/entities/File';

type Additional = {
	count: number;
	path: string;
};

export class FileRepository implements IFileRepository {
	public async insertReturningId(entityManager: EntityManager, parentId: string, name: string, mimeType: string, size: number): Promise<string> {
		const query = `INSERT INTO files (name, mimeType, size, parentId) VALUES (:name, :mimeType, :size, :parentId) RETURNING id`;
		const params = { name: name, mimeType: mimeType, parentId: parentId, size: size };

		const [rows] = await entityManager.getKnex().raw<[Pick<File, 'id'>[]]>(query, params).transacting(entityManager.getTransactionContext()!);

		return rows![0]!.id;
	}

	public async exists(entityManager: EntityManager, parentId: string, name: string): Promise<boolean>;
	public async exists(entityManager: EntityManager, id: string): Promise<boolean>;
	public async exists(entityManager: EntityManager, parentIdOrId: string, name?: string | undefined): Promise<boolean> {
		const query = name
			? `SELECT COUNT(*) as count FROM ${FILES_TABLE_NAME} WHERE parentId = :parentId AND name = :name LIMIT 1`
			: `SELECT COUNT(*) as count FROM ${FILES_TABLE_NAME} WHERE id = :id LIMIT 1`;

		const params = name ? { parentId: parentIdOrId, name: name } : { id: parentIdOrId };

		const [rows] = await entityManager.getKnex().raw<[Pick<Additional, 'count'>[]]>(query, params).transacting(entityManager.getTransactionContext()!);

		return rows![0]!.count > 0;
	}

	public async getParentId(entityManager: EntityManager, id: string): Promise<string | null> {
		const query = `SELECT parentId FROM ${FILES_TABLE_NAME} WHERE id = :id`;
		const params = { id: id };

		const [rows] = await entityManager.getKnex().raw<[{ parentId: string }[]]>(query, params).transacting(entityManager.getTransactionContext()!);

		return rows![0]?.parentId ?? null;
	}

	public async getNameAndMimeType(entityManager: EntityManager, id: string): Promise<Pick<File, 'name' | 'mimeType'> | null> {
		const query = `SELECT name, id, mimeType FROM files WHERE id = :id`;
		const params = { id: id };

		const [rows] = await entityManager
			.getKnex()
			.raw<[Pick<File, 'name' | 'mimeType'>[]]>(query, params)
			.transacting(entityManager.getTransactionContext()!);

		return rows![0] ?? null;
	}

	public async getMetadata(entityManager: EntityManager, id: string): Promise<Pick<File, 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'> | null> {
		const query = `SELECT name, mimeType, size, createdAt, updatedAt FROM files WHERE id = :id`;
		const params = { id: id };

		const [rows] = await entityManager
			.getKnex()
			.raw<[Pick<File, 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'>[]]>(query, params)
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

	public async update(entityManager: EntityManager, id: string, partial: { name?: string; parentId?: string }): Promise<void> {
		if (Object.keys(partial).length === 0) {
			return;
		}

		await entityManager.getKnex().table(FILES_TABLE_NAME).update(partial).where('id', id).transacting(entityManager.getTransactionContext()!);
	}

	public async delete(entityManager: EntityManager, parentId: string, name: string): Promise<void>;
	public async delete(entityManager: EntityManager, id: string): Promise<void>;
	public async delete(entityManager: EntityManager, parentIdOrId: string, name?: string | undefined) {
		const query = name ? `DELETE FROM files WHERE parentId = :parentId AND name = :name` : `DELETE FROM files WHERE id = :id`;
		const params = name ? { parentId: parentIdOrId, name: name } : { id: parentIdOrId };

		return await entityManager.getKnex().raw(query, params).transacting(entityManager.getTransactionContext()!);
	}
}
