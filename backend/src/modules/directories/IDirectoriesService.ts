/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { DirectoryContentDto, DirectoryContentResponse } from 'src/modules/directories/mapping/content';
import { DirectoryCreateDto, DirectoryCreateResponse } from 'src/modules/directories/mapping/create';
import { DirectoryDeleteDto } from 'src/modules/directories/mapping/delete';
import { DirectoryDownloadDto, DirectoryDownloadResponse } from 'src/modules/directories/mapping/download';
import { DirectoryMetadataDto, DirectoryMetadataResponse } from 'src/modules/directories/mapping/metadata';
import { DirectoryRenameDto } from 'src/modules/directories/mapping/rename';
import { DirectoryNotFoundException } from 'src/shared/exceptions/DirectoryNotFoundException';
import { ParentDirectoryNotFoundException } from 'src/shared/exceptions/ParentDirectoryNotFoundExceptions';
import { RootCannotBeDeletedException } from 'src/shared/exceptions/RootCannotBeDeletedException';
import { RootCannotBeRenamedException } from 'src/shared/exceptions/RootCannotBeRenamed';

export const IDirectoriesService = Symbol('IDirectoryService');

export interface IDirectoriesService {
	/**
	 * Creates a directory with given name under given parent id.
	 * Throws if a directory with that name already exists or parent does not exist.
	 * @async
	 *
	 * @throws  {ParentDirectoryNotFoundException} if parent directory does not exist
	 * @throws  {DirectoryAlreadyExistsException}  if directory already exists
	 *
	 * @param   {DirectoryCreateDto}               directoryCreateDto the dto for creating a new directory
	 * @returns {Promise<DirectoryCreateResponse>}                    the id of the directory
	 */
	create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse>;

	/**
	 * Returns the files and subdirectories of a directory.
	 * Throws if directory does not exist.
	 * @async
	 *
	 * @throws  {DirectoryNotFoundException} if directory does not exist
	 *
	 * @param   {DirectoryContentDto}               directoryContentDto the dto for getting the contents of a directory
	 * @returns {Promise<DirectoryContentResponse>}                     the contents of the directory
	 */
	contents(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse>;

	/**
	 * Returns the metadata of the directory with the given id.
	 * Throws if the directory does not exist.
	 * @async
	 *
	 * @throws  {DirectoryNotFoundException} if directory does not exist
	 *
	 * @param   {DirectoryMetadataDto}               directoryMetadataDto the dto for getting the metadata of a directory
	 * @returns {Promise<DirectoryMetadataResponse>}                      the metadata of a directory
	 */
	metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse>;

	/**
	 * Returns a stream of a ZIP archive of the contents of a directory as well as mime type and directory name.
	 * Throws if the directory at the given id does not exist.
	 * @async
	 *
	 * @throws  {DirectoryNotFoundException} if directory does not exist
	 *
	 * @param   {DirectoryDownloadDto}               directoryDownloadDto the dto for downloading a directory
	 * @returns {Promise<DirectoryDownloadResponse>}                      the stream, mimeType and directory name
	 */
	download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse>;

	/**
	 * Renames a directory.
	 * Throws if trying to rename root, parent directory does not exist,
	 * directory does not exist or a directory with same name and parent already exists.
	 * @async
	 *
	 * @throws  {RootCannotBeRenamedException}     if directory to rename is root
	 * @throws  {ParentDirectoryNotFoundException} if the parent directory does not exist
	 * @throws  {DirectoryNotFoundException}       if directory does not exist
	 * @throws  {DirectoryAlreadyExistsException}  if destination directory already exists
	 *
	 * @param   {DirectoryRenameDto}               directoryRenameDto the dto for renaming a directory
	 */
	rename(directoryRenameDto: DirectoryRenameDto): Promise<void>;

	/**
	 * Deletes a directory by its path.
	 * Throws if trying to delete root or directory at given path does not exist.
	 * @async
	 *
	 * @throws {RootCannotBeDeletedException} if trying to delete root
	 * @throws {DirectoryNotFoundException}   if directory does not exist
	 *
	 * @param {DirectoryDeleteDto} directoryDeleteDto the dto for deleting the directory
	 */
	delete(directoryDeleteDto: DirectoryDeleteDto): Promise<void>;
}
