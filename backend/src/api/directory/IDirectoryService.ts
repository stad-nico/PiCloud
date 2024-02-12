import { DirectoryContentDto, DirectoryContentResponse } from 'src/api/directory/mapping/content';
import { DirectoryCreateDto, DirectoryCreateResponse } from 'src/api/directory/mapping/create';
import { DirectoryDeleteDto, DirectoryDeleteResponse } from 'src/api/directory/mapping/delete';
import { DirectoryDownloadDto, DirectoryDownloadResponse } from 'src/api/directory/mapping/download';
import { DirectoryMetadataDto, DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata';
import { DirectoryRenameDto, DirectoryRenameResponse } from 'src/api/directory/mapping/rename';
import { DirectoryRestoreDto, DirectoryRestoreResponse } from 'src/api/directory/mapping/restore';
import { ServerError } from 'src/util/ServerError';

export const IDirectoryService = Symbol('IDirectoryService');

export interface IDirectoryService {
	/**
	 * Returns the first level subdirectories and files of a directory.
	 * Throws if directory does not exist.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 *
	 * @param   {DirectoryContentDto}               directoryContentDto the dto for getting the contents of a directory
	 * @returns {Promise<DirectoryContentResponse>}                     the contents of the directory
	 */
	content(directoryContentDto: DirectoryContentDto): Promise<DirectoryContentResponse>;

	/**
	 * Returns the metadata of a directory by its path.
	 * Throws if directory at the given path does not exist.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 *
	 * @param   {DirectoryMetadataDto}               directoryMetadataDto the dto for getting the metadata of a directory
	 * @returns {Promise<DirectoryMetadataResponse>}                      the metadata of a directory
	 */
	metadata(directoryMetadataDto: DirectoryMetadataDto): Promise<DirectoryMetadataResponse>;

	/**
	 * Returns a stream of a ZIP-archive of the contents of a directory as well as mimeType and directory name.
	 * Throws if the directory at the given path does not exist.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 *
	 * @param   {DirectoryDownloadDto}               directoryDownloadDto the dto for downloading a directory
	 * @returns {Promise<DirectoryDownloadResponse>}                      the stream, mimeType and directory name
	 */
	download(directoryDownloadDto: DirectoryDownloadDto): Promise<DirectoryDownloadResponse>;

	/**
	 * Restores a soft deleted directory by its id.
	 * Throws if no directory with the given id exists or destination path already exists.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 * @throws  {ServerError} destination must not already exist
	 *
	 * @param   {DirectoryRestoreDto}               directoryRestoreDto the dto for restoring a directory
	 * @returns {Promise<DirectoryRestoreResponse>}                     the path of the restored directory
	 */
	restore(directoryRestoreDto: DirectoryRestoreDto): Promise<DirectoryRestoreResponse>;

	/**
	 * Creates a directory by its path.
	 * Throws if a directory at that path already exists or destination parent does not exist.
	 * @async
	 *
	 * @throws  {ServerError} destination parent must exist
	 * @throws  {ServerError} destination must not already exist
	 *
	 * @param   {DirectoryCreateDto}               directoryCreateDto the dto for creating a new directory
	 * @returns {Promise<DirectoryCreateResponse>}                    the path of the created directory
	 */
	create(directoryCreateDto: DirectoryCreateDto): Promise<DirectoryCreateResponse>;

	/**
	 * Renames or moves a directory.
	 * Throws if directory does not exist, destination already exists or destination parent no exists.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 * @throws  {ServerError} destination must not already exist
	 * @throws  {ServerError} destination parent must exist
	 *
	 * @param   {DirectoryRenameDto}               directoryRenameDto the dto for renaming a directory
	 * @returns {Promise<DirectoryRenameResponse>}                    the path of the renamed directory
	 */
	rename(directoryRenameDto: DirectoryRenameDto): Promise<DirectoryRenameResponse>;

	/**
	 * Soft deletes a directory by its path.
	 * Throws if directory at given path does not exist.
	 * @async
	 *
	 * @throws  {ServerError} directory must exist
	 *
	 * @param   {DirectoryDeleteDto}               directoryDeleteDto the dto for soft deleting a directory
	 * @returns {Promise<DirectoryDeleteResponse>}                    the id of the deleted directory
	 */
	delete(directoryDeleteDto: DirectoryDeleteDto): Promise<DirectoryDeleteResponse>;
}
