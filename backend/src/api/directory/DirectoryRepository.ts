export class DirectoryRepository {}
// import { EntityManager } from '@mikro-orm/mariadb';
// import { Injectable } from '@nestjs/common';

// import { DirectoryGetContentDBResult, DirectoryGetMetadataDBResult, IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
// import { Directory } from 'src/db/entities/Directory';
// import { File } from 'src/db/entities/File';
// import { Tree } from 'src/db/entities/Tree';

// @Injectable()
// export class DirectoryRepository implements IDirectoryRepository {
// 	public async selectByPath(
// 		entityManager: EntityManager,
// 		path: string,
// 		isRecycled: boolean = false
// 	): Promise<Pick<Directory, 'uuid' | 'name'> | null> {
// 		const result1 = await entityManager
// 			.createQueryBuilder(Directory, 'directories')
// 			.select(['name', 'uuid'])
// 			.from(Directory, 'directories')
// 			.where('isRecycled = :isRecycled', { isRecycled: isRecycled })
// 			.andWhere('uuid = GET_DIRECTORY_UUID(:path)', { path: path });

// 		return result ?? null;
// 	}

// 	public async selectByUuid(
// 		entityManager: EntityManager,
// 		uuid: string,
// 		isRecycled: boolean = false
// 	): Promise<(Pick<Directory, 'name'> & { path: string }) | null> {
// 		const result: { name: string; path?: string } | null = await entityManager
// 			.createQueryBuilder()
// 			.select(['name', 'GET_DIRECTORY_PATH(uuid)'])
// 			.from(Directory, 'directories')
// 			.where('isRecycled = :isRecycled', { isRecycled: isRecycled })
// 			.andWhere('uuid = :uuid', { uuid: uuid })
// 			.getOne();

// 		if (!result?.path) {
// 			return null;
// 		}

// 		return result as { name: string; path: string };
// 	}

// 	public async exists(entityManager: EntityManager, path: string, isRecycled: boolean = false): Promise<boolean> {
// 		return await entityManager
// 			.createQueryBuilder()
// 			.select()
// 			.from(Directory, 'directories')
// 			.where('uuid = GET_DIRECTORY_UUID(:path)', { path: path })
// 			.andWhere('isRecycled = :isRecycled', { isRecycled: isRecycled })
// 			.getExists();
// 	}

// 	public async insert(entityManager: EntityManager, name: string, parentId: string | null = null) {
// 		await entityManager
// 			.createQueryBuilder()
// 			.insert()
// 			.into(Directory)
// 			.values([{ name: name, parentId: parentId }]);
// 	}

// 	public async softDelete(entityManager: EntityManager, rootUuid: string): Promise<void> {
// 		const descendants = entityManager
// 			.createQueryBuilder()
// 			.select('child')
// 			.from(Tree, 'tree')
// 			.innerJoin(Directory, 'directories', 'directories.uuid = tree.child')
// 			.where('tree.parent = :root', { root: rootUuid });

// 		await entityManager
// 			.createQueryBuilder()
// 			.update(Directory)
// 			.set({ isRecycled: true })
// 			.where(`uuid IN (${descendants.getQuery()})`)
// 			.setParameters(descendants.getParameters())
// 			.execute();
// 	}

// 	public async getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult> {
// 		const files = entityManager
// 			.createQueryBuilder()
// 			.select('COUNT(*)', 'filesAmt')
// 			.from(Tree, 'tree')
// 			.innerJoin(File, 'files', 'files.uuid = tree.child')
// 			.where('tree.parent = GET_DIRECTORY_UUID(:path) AND files.isRecycled = 0', { path: path });

// 		const directories = entityManager
// 			.createQueryBuilder()
// 			.select('COUNT(*) - 1', 'directoriesAmt')
// 			.from(Tree, 'tree')
// 			.innerJoin(Directory, 'directories', 'directories.uuid = tree.child')
// 			.where('tree.parent = GET_DIRECTORY_UUID(:path) AND directories.isRecycled = 0', { path: path });

// 		const result = await entityManager
// 			.createQueryBuilder()
// 			.select([
// 				'uuid',
// 				'name',
// 				'GET_DIRECTORY_SIZE(GET_DIRECTORY_PATH(uuid)) AS size',
// 				'filesAmt AS files',
// 				'directoriesAmt AS directories',
// 				'created',
// 				'updated',
// 			])
// 			.addCommonTableExpression(files, 'filesAmt')
// 			.addCommonTableExpression(directories, 'directoriesAmt')
// 			.from(Directory, 'directories')
// 			.innerJoin('filesAmt', 'filesAmt')
// 			.innerJoin('directoriesAmt', 'directoriesAmt')
// 			.where('uuid = GET_DIRECTORY_UUID(:path) AND isRecycled = 0', { path: path })
// 			.getRawOne();

// 		return result ?? null;
// 	}

// 	public async getContent(entityManager: EntityManager, path: string): Promise<DirectoryGetContentDBResult> {
// 		const files: Array<Pick<File, 'name' | 'mimeType' | 'size' | 'created' | 'updated'>> = await entityManager
// 			.createQueryBuilder()
// 			.select(['name', 'mimeType', 'size', 'created', 'updated'])
// 			.from(File, 'files')
// 			.where('parentId = GET_DIRECTORY_UUID(:path) AND isRecycled = 0', { path: path })
// 			.getRawMany();

// 		const directories: Array<Pick<Directory, 'name' | 'created' | 'updated'> & { size: number }> = await entityManager
// 			.createQueryBuilder()
// 			.select(['name', 'GET_DIRECTORY_SIZE(uuid) AS size', 'created', 'updated'])
// 			.from(Directory, 'directories')
// 			.where('parentId = GET_DIRECTORY_UUID(:path) AND isRecycled = 0', { path: path })
// 			.getRawMany();

// 		return { files: files, directories: directories };
// 	}

// 	public async getFilesRelative(entityManager: EntityManager, path: string): Promise<Array<Pick<File, 'uuid'> & { path: string }>> {
// 		const files: Array<{ uuid: string; path?: string }> = await entityManager
// 			.createQueryBuilder()
// 			.select(['uuid', 'GET_FILE_PATH(uuid) AS path'])
// 			.from(File, 'files')
// 			.innerJoin(Tree, 'tree', 'files.uuid = tree.child')
// 			.where('tree.parent = GET_DIRECTORY_UUID(:path) AND files.isRecycled = 0')
// 			.getMany();

// 		return files.filter((file) => file.path !== undefined).map((file) => ({ uuid: file.uuid, path: file.path!.replace(path, '') }));
// 	}

// 	public async update(entityManager: EntityManager, path: string, partial: Partial<Directory>): Promise<void> {
// 		await entityManager
// 			.createQueryBuilder()
// 			.update(Directory)
// 			.set(partial)
// 			.where(`uuid = GET_DIRECTORY_UUID(:path)`, { path: path })
// 			.execute();
// 	}

// 	public async restore(entityManager: EntityManager, rootUuid: string): Promise<void> {
// 		const descendants = entityManager
// 			.createQueryBuilder()
// 			.select('child')
// 			.from(Tree, 'tree')
// 			.innerJoin(Directory, 'directories', 'directories.uuid = tree.child')
// 			.where('tree.parent = :root', { root: rootUuid });

// 		await entityManager
// 			.createQueryBuilder()
// 			.update(Directory)
// 			.set({ isRecycled: false })
// 			.where(`uuid IN (${descendants.getQuery()})`)
// 			.setParameters(descendants.getParameters())
// 			.execute();
// 	}
// }
