import { Injectable } from '@nestjs/common';
import { Directory } from 'src/db/entities/Directory';
import { File } from 'src/db/entities/File';
import { Tree } from 'src/db/entities/Tree';
import { EntityManager } from 'typeorm';

type DirectoryGetMetadataDBResult = Omit<Directory, 'parent' | 'isRecycled'> & {
	path: string;
	size: number;
	files: number;
	directories: number;
};

export interface IDirectoryRepository {
	select(entityManager: EntityManager, path: string, isRecycled: boolean): Promise<Directory | null>;
	exists(entityManager: EntityManager, path: string): Promise<boolean>;
	insert(entityManager: EntityManager, name: string, parent: string | null, isRecycled: boolean): Promise<void>;
	softDelete(entityManager: EntityManager, root: string): Promise<void>;
	getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult | null>;
}

@Injectable()
export class DirectoryRepository implements IDirectoryRepository {
	public async select(entityManager: EntityManager, path: string, isRecycled: boolean = false): Promise<Directory | null> {
		return await entityManager
			.createQueryBuilder()
			.select('directories')
			.from(Directory, 'directories')
			.where('isRecycled = :isRecycled', { isRecycled: isRecycled ? '1' : '0' })
			.andWhere('uuid = GET_DIRECTORY_UUID(:path)', { path: path })
			.getOne();
	}

	public async exists(entityManager: EntityManager, path: string): Promise<boolean> {
		return await entityManager
			.createQueryBuilder()
			.select()
			.from(Directory, 'directories')
			.where('uuid = GET_DIRECTORY_UUID(:path)', { path: path })
			.getExists();
	}

	public async insert(entityManager: EntityManager, name: string, parent: string | null = null, isRecycled: boolean = false) {
		await entityManager
			.createQueryBuilder()
			.insert()
			.into(Directory)
			.values([{ name: name, parent: parent, isRecycled: isRecycled }])
			.execute();
	}

	public async softDelete(entityManager: EntityManager, root: string): Promise<void> {
		const descendants = entityManager
			.createQueryBuilder()
			.select('child')
			.from(Tree, 'tree')
			.innerJoin(Directory, 'directories', 'directories.uuid = tree.child')
			.where('tree.parent = :root', { root: root });

		await entityManager
			.createQueryBuilder()
			.update(Directory)
			.set({ isRecycled: true })
			.where(`uuid IN (${descendants.getQuery()})`)
			.setParameters(descendants.getParameters())
			.execute();
	}

	public async getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult | null> {
		const size = await entityManager
			.createQueryBuilder()
			.select('CAST(SUM(size) AS UNSIGNED INT)', 'size')
			.from(Tree, 'tree')
			.innerJoin(File, 'files', 'files.uuid = tree.child')
			.where('tree.parent = GET_DIRECTORY_UUID(:path) AND files.isRecycled = 0', { path: path });

		const files = await entityManager
			.createQueryBuilder()
			.select('COUNT(*)', 'filesAmt')
			.from(Tree, 'tree')
			.innerJoin(File, 'files', 'files.uuid = tree.child')
			.where('tree.parent = GET_DIRECTORY_UUID(:path) AND files.isRecycled = 0', { path: path });

		const directories = await entityManager
			.createQueryBuilder()
			.select('COUNT(*) - 1', 'directoriesAmt')
			.from(Tree, 'tree')
			.innerJoin(Directory, 'directories', 'directories.uuid = tree.child')
			.where('tree.parent = GET_DIRECTORY_UUID(:path) AND directories.isRecycled = 0', { path: path });

		return (
			(await entityManager
				.createQueryBuilder()
				.select([
					'uuid',
					'name',
					'size',
					'filesAmt AS files',
					'directoriesAmt AS directories',
					'GET_DIRECTORY_PATH(uuid) AS path',
					'created',
					'updated',
				])
				.addCommonTableExpression(size, 'size')
				.addCommonTableExpression(files, 'filesAmt')
				.addCommonTableExpression(directories, 'directoriesAmt')
				.from(Directory, 'directories')
				.innerJoin('size', 'size')
				.innerJoin('filesAmt', 'filesAmt')
				.innerJoin('directoriesAmt', 'directoriesAmt')
				.where('uuid = GET_DIRECTORY_UUID(:path) AND isRecycled = 0', { path: path })
				.getRawOne()) || null
		);
	}
}
