import { EntityManager, raw } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';

import { DirectoryGetContentDBResult, DirectoryGetMetadataDBResult, IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { Directory } from 'src/db/entities/Directory';
import { File } from 'src/db/entities/File';
import { Tree } from 'src/db/entities/Tree';

@Injectable()
export class DirectoryRepository implements IDirectoryRepository {
	public async selectByPath(
		entityManager: EntityManager,
		path: string,
		isRecycled: boolean = false
	): Promise<Pick<Directory, 'id' | 'name'> | null> {
		const result = await entityManager
			.createQueryBuilder(Directory, 'directories')
			.select(['name', 'id'])
			.where('is_recycled = ?', [isRecycled])
			.andWhere('id = GET_DIRECTORY_UUID(?)', [path])
			.getSingleResult();

		return result;
	}

	public async selectByUuid(
		entityManager: EntityManager,
		id: string,
		isRecycled: boolean = false
	): Promise<(Pick<Directory, 'name'> & { path: string }) | null> {
		const result: (Pick<Directory, 'name'> & { path?: string }) | null = await entityManager
			.createQueryBuilder(Directory, 'directories')
			.select(['name', raw('GET_DIRECTORY_PATH(id) as path')])
			.where('is_recycled = ?', [isRecycled])
			.andWhere('id = ?', [id])
			.execute('get');

		if (!result?.path) {
			return null;
		}

		return result as Pick<Directory, 'name'> & { path: string };
	}

	public async exists(entityManager: EntityManager, path: string, isRecycled: boolean = false): Promise<boolean> {
		const count = await entityManager
			.createQueryBuilder(Directory, 'directories')
			.select('*')
			.where('id = GET_DIRECTORY_UUID(?)', [path])
			.andWhere('is_recycled = ?', [isRecycled])
			.limit(1)
			.getCount();

		return count > 0;
	}

	public async insert(entityManager: EntityManager, name: string, parentId: string | null = null) {
		await entityManager.createQueryBuilder(Directory).insert({
			name: name,
			parent: parentId,
		});
	}

	public async softDelete(entityManager: EntityManager, rootId: string): Promise<void> {
		const descendants = entityManager
			.createQueryBuilder(Tree, 'tree')
			.select('child')
			.innerJoin('tree.child', 'directories')
			.where('tree.parent_id = ?', [rootId]);

		await entityManager
			.createQueryBuilder(Directory, 'directories')
			.update({ isRecycled: true })
			.where({ id: { $in: descendants.getKnexQuery() } });
	}

	public async getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult> {
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

		return undefined as any;
	}

	public async getContent(entityManager: EntityManager, path: string): Promise<DirectoryGetContentDBResult> {
		const files: Array<Pick<File, 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'>> = await entityManager
			.createQueryBuilder(File, 'files')
			.select(['name', 'mimeType', 'size', 'createdAt', 'updatedAt'])
			.where('parent_id = GET_DIRECTORY_UUID(?)', [path])
			.andWhere('is_recycled = false')
			.getResultList();

		const directoriesRaw: Array<Pick<Directory, 'name' | 'createdAt' | 'updatedAt'> & { size?: number }> = await entityManager
			.createQueryBuilder(Directory, 'directories')
			.select(['name', raw('GET_DIRECTORY_SIZE(id) AS size'), 'createdAt', 'updatedAt'])
			.where('parent_id = GET_DIRECTORY_UUID(?)', [path])
			.andWhere('is_recycled = false')
			.execute('all');

		const directories = directoriesRaw.filter((dir) => 'size' in dir) as Array<
			Pick<Directory, 'name' | 'createdAt' | 'updatedAt'> & { size: number }
		>;

		return { files: files, directories: directories };
	}

	public async getFilesRelative(entityManager: EntityManager, path: string): Promise<Array<Pick<File, 'id'> & { path: string }>> {
		// const files: Array<{ uuid: string; path?: string }> = await entityManager
		// 	.createQueryBuilder(File, "files")
		// 	.select(['id', raw('GET_FILE_PATH(id) AS path')])
		// 	.innerJoin('files.id', "tree")
		// 	.where('tree.parent = GET_DIRECTORY_UUID(:path) AND files.isRecycled = 0')
		// 	.getMany();

		// return files.filter((file) => file.path !== undefined).map((file) => ({ uuid: file.uuid, path: file.path!.replace(path, '') }));
		return [];
	}

	public async update(entityManager: EntityManager, path: string, partial: Partial<Directory>): Promise<void> {
		await entityManager.createQueryBuilder(Directory, 'directories').update(partial).where('id = GET_DIRECTORY_UUID(?)', [path]);
	}

	public async restore(entityManager: EntityManager, rootId: string): Promise<void> {
		const descendants = entityManager
			.createQueryBuilder(Tree, 'tree')
			.select('child')
			.innerJoin('tree.child', 'directories')
			.where('tree.parent_id = ?', [rootId]);

		await entityManager
			.createQueryBuilder(Directory, 'directories')
			.update({ isRecycled: false })
			.where({ id: { $in: descendants.getKnexQuery() } });
	}
}
