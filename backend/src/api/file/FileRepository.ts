import { EntityManager } from '@mikro-orm/mariadb';
import { IFileRepository } from 'src/api/file/IFileRepository';
import { FILES_TABLE_NAME, File } from 'src/db/entities/File';
import { PathUtils } from './../../util/PathUtils';

type Additional = {
	count: number;
	path: string;
};

export class FileRepository implements IFileRepository {
	public async insertReturningId(entityManager: EntityManager, name: string, mimeType: string, size: number, parentId: string): Promise<Pick<File, 'id'>> {
		const [rows] = await entityManager
			.getKnex()
			.raw<[Pick<File, 'id'>[]]>(
				// prettier-ignore
				`INSERT INTO files (name, mimeType, size, parentId) VALUES (:name, :mimeType, :size, :parentId) RETURNING id`,
				{ name: name, mimeType: mimeType, size: size, parentId: parentId }
			)
			.transacting(entityManager.getTransactionContext()!);

		return rows![0]!;
	}

	public async exists(entityManager: EntityManager, path: string): Promise<boolean> {
		const [rows] = await entityManager
			.getKnex()
			.raw<[Pick<Additional, 'count'>[]]>(
				// prettier-ignore
				`SELECT COUNT(*) as count FROM files WHERE id = GET_FILE_UUID(:path) LIMIT 1`,
				{ path: PathUtils.normalizeFilePath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		return rows![0]!.count > 0;
	}

	public async select(entityManager: EntityManager, path: string): Promise<Pick<File, 'id' | 'name' | 'mimeType'> | null> {
		const [rows] = await entityManager
			.getKnex()
			.raw<[Pick<File, 'id' | 'name' | 'mimeType'>[]]>(
				// prettier-ignore
				`SELECT name, id, mimeType FROM files WHERE id = GET_FILE_UUID(:path)`,
				{ path: PathUtils.normalizeFilePath(path) }
			)
			.transacting(entityManager.getTransactionContext()!);

		return rows![0] ?? null;
	}

	public async getMetadata(
		entityManager: EntityManager,
		path: string
	): Promise<Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'> | null> {
		const [rows] = await entityManager
			.getKnex()
			.raw<[Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'>[]]>(
				// prettier-ignore
				`SELECT id, name, mimeType, size, createdAt, updatedAt FROM files WHERE id = GET_FILE_UUID(:path)`,
				{ path: PathUtils.normalizeFilePath(path) }
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

	public async update(entityManager: EntityManager, path: string, partial: { name?: string; parentId?: string }): Promise<void> {
		if (Object.keys(partial).length === 0) {
			return;
		}

		await entityManager
			.getKnex()
			.table(FILES_TABLE_NAME)
			.update(partial)
			.whereRaw('id = GET_FILE_UUID(?)', [PathUtils.normalizeFilePath(path)])
			.transacting(entityManager.getTransactionContext()!);
	}

	public async deleteById(entityManager: EntityManager, id: string): Promise<void> {
		await entityManager.getKnex().raw(`DELETE FROM files WHERE id = :id`, { id: id }).transacting(entityManager.getTransactionContext()!);
	}

	public async deleteByPath(entityManager: EntityManager, path: string): Promise<void> {
		await entityManager
			.getKnex()
			.raw(`DELETE FROM files WHERE id = GET_FILE_UUID(:path)`, { path: PathUtils.normalizeFilePath(path) })
			.transacting(entityManager.getTransactionContext()!);
	}
}
