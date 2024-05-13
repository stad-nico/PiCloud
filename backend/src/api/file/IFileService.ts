import { FileDeleteDto } from 'src/api/file/mapping/delete';
import { FileDownloadDto, FileDownloadResponse } from 'src/api/file/mapping/download';
import { FileMetadataDto, FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileRenameDto, FileRenameResponse } from 'src/api/file/mapping/rename';
import { FileReplaceDto } from 'src/api/file/mapping/replace/FileReplaceDto';
import { FileReplaceResponse } from 'src/api/file/mapping/replace/FileReplaceResponse';
import { FileUploadDto, FileUploadResponse } from 'src/api/file/mapping/upload';

export const IFileService = Symbol('IFileService');

export interface IFileService {
	/**
	 * Uploads a file.
	 * Throws if it already exists or destination parent does not exist.
	 * @async
	 *
	 * @throws  {FileAlreadyExistsException}       if file already exists
	 * @throws  {ParentDirectoryNotFoundException} if parent directory does not exist
	 *
	 * @param   {FileUploadDto}               fileUploadDto the dto for uploading a new file
	 * @returns {Promise<FileUploadResponse>}               the path of the uploaded file
	 */
	upload(fileUploadDto: FileUploadDto): Promise<FileUploadResponse>;

	/**
	 * Uploads a file or replace if it already exists.
	 * Throws if the destination parent does not exist.
	 * @async
	 *
	 * @throws  {ParentDirectoryNotFoundException} if parent directory does not exist
	 *
	 * @param   {FileReplaceDto}               fileReplaceDto the dto for uploading or replacing a file
	 * @returns {Promise<FileReplaceResponse>}                the path of the created file
	 */
	replace(fileReplaceDto: FileReplaceDto): Promise<FileReplaceResponse>;

	/**
	 * Returns the metadata of a file.
	 * Throws if the file does not exists.
	 * @async
	 *
	 * @throws  {FileNotFoundException} if file does not exist
	 *
	 * @param   {FileMetadataDto}               fileMetadataDto the dto for getting the metadata of a file
	 * @returns {Promise<FileMetadataResponse>}                 the metadata
	 */
	metadata(fileMetadataDto: FileMetadataDto): Promise<FileMetadataResponse>;

	/**
	 * Returns a stream of the content of a file as well as mime type and filename.
	 * Throws if the file does not exist.
	 * @async
	 *
	 * @throws  {FileNotFoundException} if file does not exist
	 *
	 * @param   {FileDownloadDto}               fileDownloadDto the dto for downloading a file
	 * @returns {Promise<FileDownloadResponse>}                 the response
	 */
	download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse>;

	/**
	 * Renames or moves a file.
	 * Throws if file does not exist, destination already exists or destination parent not exists.
	 * @async
	 *
	 * @throws  {FileNotFoundException}            if file does not exist
	 * @throws  {FileAlreadyExistsException}       if destination file already exists
	 * @throws  {ParentDirectoryNotFoundException} if destination parent directory does not exist
	 *
	 * @param   {FileRenameDto}               fileRenameDto the dto for renaming a file
	 * @returns {Promise<FileRenameResponse>}               the path of the renamed file
	 */
	rename(fileRenameDto: FileRenameDto): Promise<FileRenameResponse>;

	/**
	 * Deletes a file by its path.
	 * Throws if file at given path does not exist.
	 * @async
	 *
	 * @throws {FileNotFoundException} if file does not exist
	 *
	 * @param {FileDeleteDto} fileDeleteDto the dto for soft deleting the file
	 */
	delete(fileDeleteDto: FileDeleteDto): Promise<void>;
}
