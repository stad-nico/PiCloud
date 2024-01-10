import { Injectable } from '@nestjs/common';
import { Directory } from 'src/db/entities/Directory';
import { File } from 'src/db/entities/File';
import { Tree } from 'src/db/entities/Tree';
import { EntityManager } from 'typeorm';

type DirectoryGetMetadataDBResult = Omit<Directory, 'parent' | 'isRecycled'> & {
	size: number;
	files: number;
	directories: number;
};

type DirectoryGetContentDBResult = {
	files: Array<Pick<File, 'name' | 'mimeType' | 'size' | 'created' | 'updated'>>;
	directories: Array<Pick<Directory, 'name' | 'created' | 'updated'> & { size: number }>;
};

export const IDirectoryRepository = Symbol('IDirectoryRepository');

/**
 * Helper for executing directory operations on the db
 */
export interface IDirectoryRepository {
	/**
	 * Select `name` and `uuid` of a directory.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager connection to use
	 * @param {string} path the path of the directory
	 * @param {boolean} isRecycled whether to find deleted directory
	 *
	 * @returns {Promise<Pick<Directory, 'uuid' | 'name'> | null>} the `name` and `uuid` of the directory or `null` if not found
	 */
	selectByPath(entityManager: EntityManager, path: string, isRecycled?: boolean): Promise<Pick<Directory, 'uuid' | 'name'> | null>;

	/**
	 * Select `name` and `path` of a directory.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager connection to use
	 * @param {string} uuid the uuid of the directory
	 * @param {boolean} isRecycled whether to find deleted directory
	 *
	 * @returns {Promise<(Pick<Directory, 'name'> & { path: string }) | null>} the `name` and `path` of the directory or `null` if not found
	 */
	selectByUuid(
		entityManager: EntityManager,
		uuid: string,
		isRecycled?: boolean
	): Promise<(Pick<Directory, 'name'> & { path: string }) | null>;

	/**
	 * Check if directory with `path` exists.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager connection to use
	 * @param {string} path the path of the directory
	 * @param {boolean} isRecycled whether to find deleted directory
	 *
	 * @returns {Promise<void>}
	 */
	exists(entityManager: EntityManager, path: string, isRecycled?: boolean): Promise<boolean>;

	/**
	 * Insert a new directory with `name` and `parent` (optional).
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager connection to use
	 * @param {string} name the name of the directory
	 * @param {boolean} parent the parent
	 *
	 * @returns {Promise<void>}
	 */
	insert(entityManager: EntityManager, name: string, parent?: string | null): Promise<void>;

	/**
	 * Soft delete a directory tree by the root uuid.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager connection to use
	 * @param {string} rootUuid the uuid of the tree root
	 *
	 * @returns {Promise<void>}
	 */
	softDelete(entityManager: EntityManager, rootUuid: string): Promise<void>;

	/**
	 * Get metadata of a directory by path.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager connection to use
	 * @param {string} path the path of the directory
	 *
	 * @returns {Promise<DirectoryGetMetadataDBResult>} the metadata result
	 */
	getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult>;

	/**
	 * Get first level subdirectories and files of a directory by path.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager connection to use
	 * @param {string} path the path of the directory
	 *
	 * @returns {Promise<DirectoryGetContentDBResult>} the first level result
	 */
	getContent(entityManager: EntityManager, path: string): Promise<DirectoryGetContentDBResult>;

	/**
	 * Get the relative path and uuid of all files inside a directory by path regardless of the depth.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager connection to use
	 * @param {string} path the path of the directory
	 *
	 * @returns {Promise<Array<Pick<File, 'uuid'> & { path: string }>>} the files
	 */
	getFilesRelative(entityManager: EntityManager, path: string): Promise<Array<Pick<File, 'uuid'> & { path: string }>>;

	/**
	 * Update a directory by path.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager connection to use
	 * @param {string} path the path of the directory to update
	 * @param {Partial<Directory>} partial the partial directory to update
	 *
	 * @returns {Promise<Array<Pick<File, 'uuid'> & { path: string }>>} the files
	 */
	update(entityManager: EntityManager, path: string, partial: Partial<Directory>): Promise<void>;

	/**
	 * Restore a directory tree by the root uuid.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager connection to use
	 * @param {string} rootUuid the uuid of tree root
	 *
	 * @returns {Promise<void>}
	 */
	restore(entityManager: EntityManager, rootUuid: string): Promise<void>;
}

@Injectable()
export class DirectoryRepository implements IDirectoryRepository {
	public async selectByPath(
		entityManager: EntityManager,
		path: string,
		isRecycled: boolean = false
	): Promise<Pick<Directory, 'uuid' | 'name'> | null> {
		return await entityManager
			.createQueryBuilder()
			.select(['name', 'uuid'])
			.from(Directory, 'directories')
			.where('isRecycled = :isRecycled', { isRecycled: isRecycled })
			.andWhere('uuid = GET_DIRECTORY_UUID(:path)', { path: path })
			.getOne();
	}

	public async selectByUuid(
		entityManager: EntityManager,
		uuid: string,
		isRecycled: boolean = false
	): Promise<(Pick<Directory, 'name'> & { path: string }) | null> {
		const result: { name: string; path?: string } | null = await entityManager
			.createQueryBuilder()
			.select(['name', 'GET_DIRECTORY_PATH(uuid)'])
			.from(Directory, 'directories')
			.where('isRecycled = :isRecycled', { isRecycled: isRecycled })
			.andWhere('uuid = :uuid', { uuid: uuid })
			.getOne();

		if (!result?.path) {
			return null;
		}

		return result as { name: string; path: string };
	}

	public async exists(entityManager: EntityManager, path: string, isRecycled: boolean = false): Promise<boolean> {
		return await entityManager
			.createQueryBuilder()
			.select()
			.from(Directory, 'directories')
			.where('uuid = GET_DIRECTORY_UUID(:path)', { path: path })
			.andWhere('isRecycled = :isRecycled', { isRecycled: isRecycled })
			.getExists();
	}

	public async insert(entityManager: EntityManager, name: string, parent: string | null = null) {
		await entityManager
			.createQueryBuilder()
			.insert()
			.into(Directory)
			.values([{ name: name, parent: parent }])
			.execute();
	}

	public async softDelete(entityManager: EntityManager, rootUuid: string): Promise<void> {
		const descendants = entityManager
			.createQueryBuilder()
			.select('child')
			.from(Tree, 'tree')
			.innerJoin(Directory, 'directories', 'directories.uuid = tree.child')
			.where('tree.parent = :root', { root: rootUuid });

		await entityManager
			.createQueryBuilder()
			.update(Directory)
			.set({ isRecycled: true })
			.where(`uuid IN (${descendants.getQuery()})`)
			.setParameters(descendants.getParameters())
			.execute();
	}

	public async getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult> {
		const files = entityManager
			.createQueryBuilder()
			.select('COUNT(*)', 'filesAmt')
			.from(Tree, 'tree')
			.innerJoin(File, 'files', 'files.uuid = tree.child')
			.where('tree.parent = GET_DIRECTORY_UUID(:path) AND files.isRecycled = 0', { path: path });

		const directories = entityManager
			.createQueryBuilder()
			.select('COUNT(*) - 1', 'directoriesAmt')
			.from(Tree, 'tree')
			.innerJoin(Directory, 'directories', 'directories.uuid = tree.child')
			.where('tree.parent = GET_DIRECTORY_UUID(:path) AND directories.isRecycled = 0', { path: path });

		const result = await entityManager
			.createQueryBuilder()
			.select([
				'uuid',
				'name',
				'GET_DIRECTORY_SIZE(GET_DIRECTORY_PATH(uuid)) AS size',
				'filesAmt AS files',
				'directoriesAmt AS directories',
				'created',
				'updated',
			])
			.addCommonTableExpression(files, 'filesAmt')
			.addCommonTableExpression(directories, 'directoriesAmt')
			.from(Directory, 'directories')
			.innerJoin('filesAmt', 'filesAmt')
			.innerJoin('directoriesAmt', 'directoriesAmt')
			.where('uuid = GET_DIRECTORY_UUID(:path) AND isRecycled = 0', { path: path })
			.getRawOne();

		return result || null;
	}

	public async getContent(entityManager: EntityManager, path: string): Promise<DirectoryGetContentDBResult> {
		const files: Array<Pick<File, 'name' | 'mimeType' | 'size' | 'created' | 'updated'>> = await entityManager
			.createQueryBuilder()
			.select(['name', 'mimeType', 'size', 'created', 'updated'])
			.from(File, 'files')
			.where('parent = GET_DIRECTORY_UUID(:path) AND isRecycled = 0', { path: path })
			.getRawMany();

		const directories: Array<Pick<Directory, 'name' | 'created' | 'updated'> & { size: number }> = await entityManager
			.createQueryBuilder()
			.select(['name', 'GET_DIRECTORY_SIZE(uuid) AS size', 'created', 'updated'])
			.from(Directory, 'directories')
			.where('parent = GET_DIRECTORY_UUID(:path) AND isRecycled = 0', { path: path })
			.getRawMany();

		return { files: files, directories: directories };
	}

	public async getFilesRelative(entityManager: EntityManager, path: string): Promise<Array<Pick<File, 'uuid'> & { path: string }>> {
		const files: Array<{ uuid: string; path?: string }> = await entityManager
			.createQueryBuilder()
			.select(['uuid', 'GET_FILE_PATH(uuid) AS path'])
			.from(File, 'files')
			.innerJoin(Tree, 'tree', 'files.uuid = tree.child')
			.where('tree.parent = GET_DIRECTORY_UUID(:path) AND files.isRecycled = 0')
			.getMany();

		return files.filter((file) => file.path !== undefined).map((file) => ({ uuid: file.uuid, path: file.path!.replace(path, '') }));
	}

	public async update(entityManager: EntityManager, path: string, partial: Partial<Directory>): Promise<void> {
		await entityManager
			.createQueryBuilder()
			.update(Directory)
			.set(partial)
			.where(`uuid = GET_DIRECTORY_UUID(:path)`, { path: path })
			.execute();
	}

	public async restore(entityManager: EntityManager, rootUuid: string): Promise<void> {
		const descendants = entityManager
			.createQueryBuilder()
			.select('child')
			.from(Tree, 'tree')
			.innerJoin(Directory, 'directories', 'directories.uuid = tree.child')
			.where('tree.parent = :root', { root: rootUuid });

		await entityManager
			.createQueryBuilder()
			.update(Directory)
			.set({ isRecycled: false })
			.where(`uuid IN (${descendants.getQuery()})`)
			.setParameters(descendants.getParameters())
			.execute();
	}
}
