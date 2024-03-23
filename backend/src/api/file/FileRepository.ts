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

	public async insertReturningId(entityManager: EntityManager, name: string, mimeType: string, parentId: string | null = null): Promise<Pick<File, 'id'>> {
		const result = await entityManager
			.getKnex()
			.raw<[Pick<File, 'id'>[]]>(
				// prettier-ignore
				`INSERT INTO files (name, mimeType, parentId) VALUES (:name, :mimeType, :parentId) RETURNING id`,
				{ name: name, mimeType: mimeType, parentId: parentId }
			)
			.transacting(entityManager.getTransactionContext()!);

		return this.validate(result[0] ?? [], ['id'])[0]!;
	}

	public async exists(entityManager: EntityManager, path: string): Promise<boolean> {
		const result = await entityManager
			.getKnex()
			.raw<[{ count: number }[]]>(
				// prettier-ignore
				`SELECT COUNT(*) as count FROM directories WHERE id = GET_FILE_UUID(:path) LIMIT 1`,
				{ path: path }
			)
			.transacting(entityManager.getTransactionContext()!);

		const count = this.validate(result[0] ?? [], ['count'])[0]?.count ?? 0;

		return count > 0;
	}

	public async select(entityManager: EntityManager, path: string): Promise<Pick<File, 'id' | 'name' | 'mimeType'> | null> {
		const result = await entityManager
			.getKnex()
			.raw<[{ id: string; name: string }[]]>(
				// prettier-ignore
				`SELECT name, id, mimeType FROM files WHERE id = GET_DIRECTORY_UUID(:path)`,
				{ path: path }
			)
			.transacting(entityManager.getTransactionContext()!);

		const mapped = result[0]!.map((x) => entityManager.map(File, x));

		return this.validate(mapped, ['id', 'name', 'mimeType'])[0] ?? null;
	}

	public async getMetadata(
		entityManager: EntityManager,
		path: string
	): Promise<Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'> | null> {
		const result = await entityManager
			.getKnex()
			.raw<[Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'>[]]>(
				// prettier-ignore
				`SELECT id, name, mimeType, size, createdAt, updatedAt FROM files WHERE id = GET_FILE_UUID(:path)`,
				{ path: path }
			)
			.transacting(entityManager.getTransactionContext()!);

		const mapped = (result[0] ?? []).map((x) => entityManager.map(File, x));

		return this.validate(mapped, ['id', 'name', 'mimeType', 'size', 'createdAt', 'updatedAt'])[0] ?? null;
	}

	public async update(entityManager: EntityManager, path: string, partial: Partial<File>): Promise<void> {
		await entityManager.createQueryBuilder(File, 'files').update(partial).where(`id = GET_DIRECTORY_UUID(:path)`, [path]).execute();
	}

	public async deleteById(entityManager: EntityManager, id: string): Promise<void> {
		await entityManager.getKnex().raw(`DELETE FROM files WHERE id = :id`, { id: id }).transacting(entityManager.getTransactionContext()!);
	}

	public async deleteByPath(entityManager: EntityManager, path: string): Promise<void> {
		await entityManager
			.getKnex()
			.raw(`DELETE FROM files WHERE id = GET_FILE_UUID(:path)`, { path: path })
			.transacting(entityManager.getTransactionContext()!);
	}
}
