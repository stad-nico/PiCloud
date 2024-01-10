import { EntityManager } from 'typeorm';

import { Directory } from 'src/db/entities/Directory';
import { File } from 'src/db/entities/File';

export type DirectoryGetMetadataDBResult = Omit<Directory, 'parent' | 'isRecycled'> & {
	size: number;
	files: number;
	directories: number;
};

export type DirectoryGetContentDBResult = {
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
