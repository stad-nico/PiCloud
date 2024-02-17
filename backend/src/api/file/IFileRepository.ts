import { EntityManager } from '@mikro-orm/mariadb';

import { File } from 'src/db/entities/File';

export const IFileRepository = Symbol('IFileRepository');

/**
 * Interface for executing file operations on the db.
 * @interface
 */
export interface IFileRepository {
	/**
	 * Checks if a file at the given path exists.
	 * @async
	 *
	 * @param   {EntityManager} entityManager the entityManager
	 * @param   {string}        path          the path
	 * @param   {boolean}       isRecycled    if the file to look for should be a recycled one
	 * @returns {boolean}                     whether a file exists
	 */
	exists(entityManager: EntityManager, path: string, isRecycled: boolean): Promise<boolean>;

	/**
	 * Selects id, name and mimeType of a file at the given path.
	 * Returns null if no file was found.
	 * @async
	 *
	 * @param   {EntityManager} entityManager the entityManager
	 * @param   {string}        path          the path
	 * @param   {boolean}       isRecycled    if the file to look for should be a recycled one
	 * @returns {Promise<Pick<File, 'id' | 'name' | 'mimeType'> | null>} the id, name and mimeType
	 */
	selectByPath(entityManager: EntityManager, path: string, isRecycled: boolean): Promise<Pick<File, 'id' | 'name' | 'mimeType'> | null>;

	/**
	 * Selects name and path of a file with the given id.
	 * Returns null if no file was found.
	 * @async
	 *
	 * @param   {EntityManager} entityManager the entityManager
	 * @param   {string}        id            the id of the file
	 * @param   {boolean}       isRecycled    if the file to look for should be a recycled one
	 * @returns {Promise<(Pick<File, 'name'> & { path: string }) | null>} the id, name and mimeType
	 */
	selectById(entityManager: EntityManager, id: string, isRecycled: boolean): Promise<{ path: string } | null>;

	/**
	 * Inserts a new file entity into the db and returns the id of the file.
	 * @async
	 *
	 * @param   {EntityManager}         entityManager the entityManager
	 * @param   {string}                name          the filename
	 * @param   {string}                mimeType      the mimeType of the file
	 * @param   {string|null}           parent        the parent
	 * @returns {Promise<{id: string}>}               the id
	 */
	insertReturningId(entityManager: EntityManager, name: string, mimeType: string, parent: string | null): Promise<Pick<File, 'id'>>;

	/**
	 * Soft deletes a file by setting isRecycled to true.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager
	 * @param {string}        id            the id of the file to soft delete
	 */
	softDelete(entityManager: EntityManager, id: string): Promise<void>;

	/**
	 * Selects the metadata of a file from the db by its path.
	 * Returns null if no file at that path exists.
	 * @async
	 *
	 * @param   {EntityManager}      entityManager the entityManager
	 * @param   {string}             path          the path of the file to soft delete
	 * @returns {Promise<File|null>}               the file
	 */
	getMetadata(
		entityManager: EntityManager,
		path: string
	): Promise<Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'> | null>;

	/**
	 * Updates a file.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager
	 * @param {string}        path          the path of the file to update
	 * @param {Partial<File>} partial       the properties to update
	 */
	update(entityManager: EntityManager, path: string, partial: Partial<File>): Promise<void>;

	/**
	 * Restores a file by setting isRecycled to false.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager
	 * @param {string}        id            the id of the file to restore
	 */
	restore(entityManager: EntityManager, uuid: string): Promise<void>;

	/**
	 * Deletes a file from the db.
	 *
	 * @param {EntityManager} entityManager the entityManager
	 * @param {string}        path          the path of the file to delete
	 * @param {boolean}       isRecycled    whether the file to delete should be a recycled one
	 */
	hardDelete(entityManager: EntityManager, path: string, isRecycled: boolean): Promise<void>;
}
