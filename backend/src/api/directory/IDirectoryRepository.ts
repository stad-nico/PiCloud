/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { EntityManager } from '@mikro-orm/mariadb';

import { Directory } from 'src/db/entities/Directory';
import { File } from 'src/db/entities/File';

export type DirectoryGetMetadataDBResult = Pick<Directory, 'name' | 'createdAt' | 'updatedAt'> & {
	parentId: string;
	size: number;
	files: number;
	directories: number;
};

export type DirectoryGetContentsDBResult = {
	files: Array<Pick<File, 'id' | 'name' | 'mimeType' | 'createdAt' | 'updatedAt' | 'size'>>;
	directories: Array<
		Pick<Directory, 'id' | 'name' | 'createdAt' | 'updatedAt'> & {
			size: number;
			files: number;
			directories: number;
		}
	>;
};

export type DirectoryRecursiveContentResponse = {
	files: Array<{ id: string; name: string; parentId: string }>;
	directories: Array<{ id: string; name: string; parentId: string | null }>;
};

export const IDirectoryRepository = Symbol('IDirectoryRepository');

/**
 * Interface for executing directory operations on the db.
 * @interface
 */
export interface IDirectoryRepository {
	/**
	 * Inserts a new directory into the db and returns its id.
	 * Throws if entity with same name and parent already exists.
	 * @async
	 *
	 * @throws entity must not already exist
	 *
	 * @param   {EntityManager} entityManager the entityManager
	 * @param   {string}        parentId      the parentId of the directory
	 * @param   {string}        name          the name of the directory
	 */
	insertReturningId(entityManager: EntityManager, parentId: string, name: string): Promise<string>;

	/**
	 * Checks if a directory with given parent and name exists.
	 * @async
	 *
	 * @param   {EntityManager}    entityManager the entityManager
	 * @param   {string}           parentId      the id of the parent directory
	 * @param   {string}           name          the name of the directory
	 * @returns {Promise<boolean>}               whether a directory with that parent and name exists
	 */
	exists(entityManager: EntityManager, parentId: string, name: string): Promise<boolean>;

	/**
	 * Checks if a directory with given id exists.
	 * @async
	 *
	 * @param   {EntityManager}    entityManager the entityManager
	 * @param   {string}           id            the id of the directory
	 * @returns {Promise<boolean>}               whether a directory with that id exists
	 */
	exists(entityManager: EntityManager, id: string): Promise<boolean>;

	/**
	 * Selects the name of the directory with the given id.
	 * Returns null if no directory was found.
	 * @async
	 *
	 * @param   {EntityManager}          entityManager  the entityManager
	 * @param   {string}                 id             the id of the directory
	 * @returns {Promise<string | null>}                the name and id of the directory
	 */
	getName(entityManager: EntityManager, path: string): Promise<string | null>;

	/**
	 * Selects the parent id of the directory with the given id.
	 * @async
	 *
	 * @param   {EntityManager}   entityManager the entityManager
	 * @param   {string}          id            the id of the directory
	 * @returns {Promise<string | null>}               the parentId of the directory
	 */
	getParentId(entityManager: EntityManager, id: string): Promise<string | null>;

	/**
	 * Selects the metadata of the directory with given id.
	 * @async
	 *
	 * @param   {EntityManager}                                entityManager the entityManager
	 * @param   {string}                                       id            the id of the directory
	 * @returns {Promise<DirectoryGetMetadataDBResult | null>}               the metadata
	 */
	getMetadata(entityManager: EntityManager, path: string): Promise<DirectoryGetMetadataDBResult | null>;

	/**
	 * Selects the files and subdirectories of the directory with the given id.
	 * @async
	 *
	 * @param   {EntityManager}                               entityManager the entityManager
	 * @param   {string}                                      id            the id of the directory
	 * @returns {Promise<DirectoryGetContentDBResult | null>}               the result
	 */
	getContents(entityManager: EntityManager, id: string): Promise<DirectoryGetContentsDBResult>;

	/**
	 * Selects the files and subdirectory of the directory with the given id recursively.
	 * @async
	 *
	 * @param   {EntityManager}                               entityManager the entityManager
	 * @param   {string}                                      id            the id of the directory
	 * @returns {Promise<DirectoryGetContentDBResult | null>}               the result
	 */
	getContentsRecursive(entityManager: EntityManager, id: string): Promise<DirectoryRecursiveContentResponse>;

	/**
	 * Updates a directory.
	 * @async
	 *
	 * @param {EntityManager}                        entityManager the entityManager
	 * @param {string}                               id            the id of the directory to update
	 * @param {{ name?: string; parentId?: string }} partial       the partial directory to update
	 */
	update(entityManager: EntityManager, id: string, partial: { name?: string; parentId?: string }): Promise<void>;

	/**
	 * Deletes a directory tree by the root id.
	 * Deletes all subdirectories and files.
	 * @async
	 *
	 * @param {EntityManager} entityManager the entityManager
	 * @param {string}        rootUuid      the id of the tree root
	 */
	delete(entityManager: EntityManager, rootUuid: string): Promise<void>;
}
