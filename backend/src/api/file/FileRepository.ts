export class FileRepository {}
// import { EntityManager } from '@mikro-orm/mariadb';
// import { File } from 'src/db/entities/File';

// export class FileRepository {
// 	public async exists(entityManager: EntityManager, path: string, isRecycled: boolean = false): Promise<boolean> {
// 		return await entityManager
// 			.createQueryBuilder()
// 			.select()
// 			.from(File, 'files')
// 			.where('uuid = GET_FILE_UUID(:path)', { path: path })
// 			.andWhere('isRecycled = :isRecycled', { isRecycled: isRecycled })
// 			.getExists();
// 	}

// 	public async selectByPath(
// 		entityManager: EntityManager,
// 		path: string,
// 		isRecycled: boolean = false
// 	): Promise<Pick<File, 'uuid' | 'name' | 'mimeType'> | null> {
// 		const result = await entityManager
// 			.createQueryBuilder()
// 			.select(['uuid', 'name', 'mimeType'])
// 			.from(File, 'files')
// 			.where('uuid = GET_FILE_UUID(:path)', { path: path })
// 			.andWhere('isRecycled = :isRecycled', { isRecycled: isRecycled })
// 			.getRawOne();

// 		return result ?? null;
// 	}

// 	public async selectByUuid(
// 		entityManager: EntityManager,
// 		uuid: string,
// 		isRecycled: boolean = false
// 	): Promise<(Pick<File, 'name'> & { path: string }) | null> {
// 		const raw = await entityManager
// 			.createQueryBuilder()
// 			.select(['name', 'GET_FILE_PATH(uuid)'])
// 			.from(File, 'files')
// 			.where('uuid = :uuid', { uuid: uuid })
// 			.andWhere('isRecycled = :isRecycled', { isRecycled: isRecycled })
// 			.getRawOne();

// 		const result: (Pick<File, 'name'> & { path?: string }) | null = raw ?? null;

// 		if (!result?.path) {
// 			return null;
// 		}

// 		return result as { name: string; path: string };
// 	}

// 	public async insertReturningUuid(
// 		entityManager: EntityManager,
// 		name: string,
// 		mimeType: string,
// 		parentId: string | null = null
// 	): Promise<Pick<File, 'uuid'>> {
// 		const result = await entityManager
// 			.createQueryBuilder()
// 			.insert()
// 			.into(File)
// 			.values([{ name: name, mimeType: mimeType, parentId: parentId }])
// 			.returning('uuid')
// 			.execute();

// 		return result.generatedMaps[0] as { uuid: string };
// 	}

// 	public async softDelete(entityManager: EntityManager, uuid: string): Promise<void> {
// 		await entityManager.createQueryBuilder().update(File).set({ isRecycled: true }).where('uuid = :uuid', { uuid: uuid }).execute();
// 	}

// 	public async getMetadata(entityManager: EntityManager, path: string): Promise<File | null> {
// 		const result = await entityManager
// 			.createQueryBuilder()
// 			.select(['uuid', 'name', 'mimeType', 'size', 'created', 'updated'])
// 			.from(File, 'files')
// 			.where('uuid = GET_FILE_UUID(:path) AND isRecycled = 0', { path: path })
// 			.getRawOne();

// 		return result ?? null;
// 	}

// 	public async update(entityManager: EntityManager, path: string, partial: Partial<File>): Promise<void> {
// 		await entityManager
// 			.createQueryBuilder()
// 			.update(File)
// 			.set(partial)
// 			.where(`uuid = GET_DIRECTORY_UUID(:path)`, { path: path })
// 			.execute();
// 	}

// 	public async restore(entityManager: EntityManager, uuid: string): Promise<void> {
// 		await entityManager.createQueryBuilder().update(File).set({ isRecycled: false }).where('uuid = :uuid', { uuid: uuid }).execute();
// 	}

// 	public async hardDelete(entityManager: EntityManager, path: string, isRecycled: boolean = false): Promise<void> {
// 		await entityManager
// 			.createQueryBuilder()
// 			.delete()
// 			.from(File, 'files')
// 			.where('uuid = GET_FILE_UUID(:path)', { path: path })
// 			.andWhere('isRecycled = :isRecycled', { isRecycled: isRecycled })
// 			.execute();
// 	}
// }
