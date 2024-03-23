import { EntityManager } from '@mikro-orm/mariadb';

import { File } from 'src/db/entities/File';

export const IFileRepository = Symbol('IFileRepository');

/**
 * Interface for executing file operations on the db.
 * @interface
 */
export interface IFileRepository {
	/**
	 * Inserts a new file entity into the db and returns the id of the file.
	 * Throws if entity with same name and parentId already exists.
	 * @async
	 *
	 * @throws entity must not already exist
	 *
	 * @param   {EntityManager}         entityManager the entityManager
	 * @param   {string}                name          the filename
	 * @param   {string}                mimeType      the mimeType of the file
	 * @param   {string|null}           parent        the parent
	 * @returns {Promise<{id: string}>}               the id
	 */
	insertReturningId(entityManager: EntityManager, name: string, mimeType: string, parent: string | null): Promise<Pick<File, 'id'>>;

	/**
	 * Checks if the file at the given path exists.
	 * @async
	 *
	 * @param   {EntityManager} entityManager the entityManager
	 * @param   {string}        path          the path
	 * @returns {boolean}                     whether the file exists
	 */
	exists(entityManager: EntityManager, path: string): Promise<boolean>;

	/**
	 * Selects id, name and mimeType of the file at the given path.
	 * Returns null if no file was found.
	 * @async
	 *
	 * @param   {EntityManager} entityManager the entityManager
	 * @param   {string}        path          the path
	 * @returns {Promise<Pick<File, 'id' | 'name' | 'mimeType'> | null>} the id, name and mimeType
	 */
	select(entityManager: EntityManager, path: string): Promise<Pick<File, 'id' | 'name' | 'mimeType'> | null>;

	/**
	 * Selects the metadata of the file by its path.
	 * Returns null if no file at that path exists.
	 * @async
	 *
	 * @param   {EntityManager}      entityManager the entityManager
	 * @param   {string}             path          the path of the file to get the metadata from
	 * @returns {Promise<File|null>}               the file
	 */
	getMetadata(entityManager: EntityManager, path: string): Promise<Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'> | null>;

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
	 * Deletes a file from the db by its path.
	 *
	 * @param {EntityManager} entityManager the entityManager
	 * @param {string}        path          the path of the file to delete
	 */
	deleteByPath(entityManager: EntityManager, path: string): Promise<void>;

	/**
	 * Deletes a file from the db by its id.
	 *
	 * @param {EntityManager} entityManager the entityManager
	 * @param {string}        id            the id of the file to delete
	 */
	deleteById(entityManager: EntityManager, id: string): Promise<void>;
}
