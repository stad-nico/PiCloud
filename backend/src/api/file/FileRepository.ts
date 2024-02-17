import { EntityManager } from '@mikro-orm/mariadb';
import { IFileRepository } from 'src/api/file/IFileRepository';
import { File } from 'src/db/entities/File';

type Additional = {
	count: number;
	path: string;
};

export class FileRepository implements IFileRepository {
	private validate<T extends Array<keyof (File & Additional)>>(
		entities: Array<Partial<File & Additional>>,
		requiredKeys: T
	): Array<Pick<File & Additional, T[number]>> {
		const output = [];

		for (const entity of entities) {
			for (const requiredKey of requiredKeys) {
				if (!(requiredKey in entity)) {
					continue;
				}
			}

			output.push(entity as Pick<File & Additional, T[number]>);
		}

		return output;
	}

	public async exists(entityManager: EntityManager, path: string, isRecycled: boolean = false): Promise<boolean> {
		const result = await entityManager.getKnex().raw<[{ count: number }[]]>(
			`SELECT COUNT(*) as count
			FROM directories
			WHERE is_recycled = :isRecycled AND id = GET_FILE_UUID(:path)
			LIMIT 1`,
			{ isRecycled: isRecycled, path: path }
		);

		const count = this.validate(result[0] ?? [], ['count'])[0]?.count ?? 0;

		return count > 0;
	}

	public async selectByPath(
		entityManager: EntityManager,
		path: string,
		isRecycled: boolean = false
	): Promise<Pick<File, 'id' | 'name' | 'mimeType'> | null> {
		const result = await entityManager.getKnex().raw<[{ id: string; name: string }[]]>(
			`SELECT name, id, mime_type 
			FROM files 
			WHERE is_recycled = :isRecycled AND id = GET_DIRECTORY_UUID(:path)`,
			{ isRecycled: isRecycled, path: path }
		);

		const mapped = result[0]!.map((x) => entityManager.map(File, x));

		return this.validate(mapped, ['id', 'name', 'mimeType'])[0] ?? null;
	}

	public async selectById(entityManager: EntityManager, id: string, isRecycled: boolean = false): Promise<{ path: string } | null> {
		const result = await entityManager.getKnex().raw<[{ path: string }[]]>(
			`SELECT GET_DIRECTORY_PATH(id) as path
			FROM files
			WHERE is_recycled = :isRecycled AND id = :id`,
			{ isRecycled: isRecycled, id: id }
		);

		const mapped = result[0]!.map((x) => entityManager.map(File, x));

		return this.validate(mapped, ['path'])[0] ?? null;
	}

	public async insertReturningId(
		entityManager: EntityManager,
		name: string,
		mimeType: string,
		parentId: string | null = null
	): Promise<Pick<File, 'id'>> {
		const result = await entityManager.getKnex().raw<[Pick<File, 'id'>[]]>(
			`INSERT INTO files (name, mime_type, parent_id)
            VALUES (:name, :mimeType, :parentId)
            RETURNING id`,
			{ name: name, mimeType: mimeType, parentId: parentId }
		);

		return this.validate(result[0] ?? [], ['id'])[0]!;
	}

	public async softDelete(entityManager: EntityManager, id: string): Promise<void> {
		await entityManager.getKnex().raw(
			`UPDATE files
            SET is_recycled = true
            WHERE id = :id`,
			{ id: id }
		);
	}

	public async getMetadata(
		entityManager: EntityManager,
		path: string
	): Promise<Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'> | null> {
		const result = await entityManager.getKnex().raw<[Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'>[]]>(
			`SELECT id, name, mime_type, size, created_at, updated_at
            FROM files
            WHERE is_recycled = false AND id = GET_FILE_UUID(:path)`,
			{ path: path }
		);

		const mapped = (result[0] ?? []).map((x) => entityManager.map(File, x));

		return this.validate(mapped, ['id', 'name', 'mimeType', 'size', 'createdAt', 'updatedAt'])[0] ?? null;
	}

	public async update(entityManager: EntityManager, path: string, partial: Partial<File>): Promise<void> {
		await entityManager.createQueryBuilder(File, 'files').update(partial).where(`id = GET_DIRECTORY_UUID(:path)`, [path]).execute();
	}

	public async restore(entityManager: EntityManager, id: string): Promise<void> {
		await entityManager.getKnex().raw(
			`UPDATE files
            SET is_recycled = false
            WHERE id = :id`,
			{ id: id }
		);
	}

	public async hardDelete(entityManager: EntityManager, path: string, isRecycled: boolean = false): Promise<void> {
		await entityManager.getKnex().raw(
			`DELETE FROM files
            WHERE is_recycled = :isRecycled AND id = GET_FILE_UUID(:path)`,
			{ isRecycled: isRecycled, path: path }
		);
	}
}
