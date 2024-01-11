import { File } from 'src/db/entities/File';
import { EntityManager } from 'typeorm';

export class FileRepository {
	public async exists(entityManager: EntityManager, path: string, isRecycled: boolean = false): Promise<boolean> {
		return await entityManager
			.createQueryBuilder()
			.select()
			.from(File, 'files')
			.where('uuid = GET_FILE_UUID(:path)', { path: path })
			.andWhere('isRecycled = :isRecycled', { isRecycled: isRecycled })
			.getExists();
	}

	public async selectByPath(
		entityManager: EntityManager,
		path: string,
		isRecycled: boolean = false
	): Promise<Pick<File, 'uuid' | 'name' | 'mimeType'> | null> {
		return await entityManager
			.createQueryBuilder()
			.select(['uuid', 'name', 'mimeType'])
			.from(File, 'files')
			.where('uuid = GET_FILE_UUID(:path)', { path: path })
			.andWhere('isRecycled = :isRecycled', { isRecycled: isRecycled })
			.getOne();
	}

	public async insertReturningUuid(
		entityManager: EntityManager,
		name: string,
		mimeType: string,
		parent: string | null = null
	): Promise<Pick<File, 'uuid'>> {
		await entityManager
			.createQueryBuilder()
			.insert()
			.into(File)
			.values([{ name: name, mimeType: mimeType, parent: parent }])
			.returning('uuid')
			.execute();
	}

	public async softDelete(entityManager: EntityManager, uuid: string): Promise<void> {
		await entityManager.createQueryBuilder().update(File).set({ isRecycled: true }).where('uuid = :uuid', { uuid: uuid }).execute();
	}

	public async getMetadata(entityManager: EntityManager, path: string): Promise<File | null> {
		const result = await entityManager
			.createQueryBuilder()
			.select(['uuid', 'name', 'mimeType', 'size', 'created', 'updated'])
			.from(File, 'files')
			.where('uuid = GET_DIRECTORY_UUID(:path) AND isRecycled = 0', { path: path })
			.getOne();

		return result ?? null;
	}

	public async update(entityManager: EntityManager, path: string, partial: Partial<File>): Promise<void> {
		await entityManager
			.createQueryBuilder()
			.update(File)
			.set(partial)
			.where(`uuid = GET_DIRECTORY_UUID(:path)`, { path: path })
			.execute();
	}
}
