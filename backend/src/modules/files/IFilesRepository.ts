/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { EntityManager } from '@mikro-orm/mariadb';

import { File } from 'src/db/entities/file.entity';

export const IFilesRepository = Symbol('IFileRepository');

/**
 * Interface for executing file operations on the db.
 * @interface
 */
export interface IFilesRepository {
	/**
	 * Inserts a new file entity into the db and returns the id of the file.
	 * Throws if entity with same name and parentId already exists.
	 * @async
	 *
	 * @throws entity must not already exist
	 *
	 * @param   {EntityManager}         entityManager the entityManager
	 * @param   {string}                parentId      the parentId
	 * @param   {string}                name          the filename
	 * @param   {string}                mimeType      the mimeType
	 * @param   {number}                size          the size
	 * @returns {Promise<{id: string}>}               the id
	 */
	insertReturningId(entityManager: EntityManager, parentId: string, name: string, mimeType: string, size: number): Promise<string>;

	/**
	 * Checks if the file with the given id exists.
	 * @async
	 *
	 * @param   {EntityManager} entityManager the entityManager
	 * @param   {string}        id            the id
	 * @returns {boolean}                     whether the file exists
	 */
	exists(entityManager: EntityManager, id: string): Promise<boolean>;

	/**
	 * Checks if the file with the given parentId and name exists.
	 * @async
	 *
	 * @param   {EntityManager} entityManager the entityManager
	 * @param   {string}        parentId      the id of the parent directory
	 * @param   {string}        name          the name
	 * @returns {boolean}                     whether the file exists
	 */
	exists(entityManager: EntityManager, parentId: string, name: string): Promise<boolean>;

	/**
	 * Selects the parent id of the file with the given id.
	 * @async
	 *
	 * @param   {EntityManager}   entityManager the entityManager
	 * @param   {string}          id            the id of the file
	 * @returns {Promise<string | null>}        the parentId of the file
	 */
	getParentId(entityManager: EntityManager, id: string): Promise<string | null>;

	/**
	 * Selects name and mimeType of the file with the given id.
	 * Returns null if no file was found.
	 * @async
	 *
	 * @param   {EntityManager} entityManager the entityManager
	 * @param   {string}        id            the id
	 * @returns {Promise<Pick<File, 'name' | 'mimeType'> | null>} the name and mimeType
	 */
	getNameAndMimeType(entityManager: EntityManager, path: string): Promise<Pick<File, 'name' | 'mimeType'> | null>;

	/**
	 * Selects the metadata of the file with the given id.
	 * Returns null if no file with that id exists.
	 * @async
	 *
	 * @param   {EntityManager}      entityManager the entityManager
	 * @param   {string}             id            the id of the file
	 * @returns {Promise<File|null>}               the file
	 */
	getMetadata(entityManager: EntityManager, id: string): Promise<Pick<File, 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'> | null>;

	/**
	 * Updates a file.
	 * @async
	 *
	 * @param {EntityManager}                      entityManager the entityManager
	 * @param {string}                             id            the id of the file to update
	 * @param {{name?: string, parentId?: string}} partial       the properties to update
	 */
	update(entityManager: EntityManager, id: string, partial: { name?: string; parentId?: string }): Promise<void>;

	/**
	 * Deletes a file from the db by its parent id and name.
	 *
	 * @param {EntityManager} entityManager the entityManager
	 * @param {string}        parentId      the parentId of the file to delete
	 * @param {string}        name          the name of the file to delete
	 */
	delete(entityManager: EntityManager, parentId: string, name: string): Promise<void>;

	/**
	 * Deletes a file from the db by its id.
	 *
	 * @param {EntityManager} entityManager the entityManager
	 * @param {string}        id            the id of the file to delete
	 */
	delete(entityManager: EntityManager, id: string): Promise<void>;
}
