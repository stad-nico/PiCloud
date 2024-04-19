import { createReadStream } from 'fs';
import * as path from 'path';

import { EntityManager } from '@mikro-orm/mariadb';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { IFileRepository } from 'src/api/file/IFileRepository';
import { IFileService } from 'src/api/file/IFileService';
import { FileDeleteDto } from 'src/api/file/mapping/delete';
import { FileDownloadDto, FileDownloadResponse } from 'src/api/file/mapping/download';
import { FileMetadataDto, FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileRenameDto, FileRenameResponse } from 'src/api/file/mapping/rename';
import { FileReplaceDto } from 'src/api/file/mapping/replace/FileReplaceDto';
import { FileReplaceResponse } from 'src/api/file/mapping/replace/FileReplaceResponse';
import { FileUploadDto, FileUploadResponse } from 'src/api/file/mapping/upload';
import { StoragePath } from 'src/disk/DiskService';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';
import { ServerError } from 'src/util/ServerError';

/**
 * Service for CRUD operations on file entities.
 * @class
 */
@Injectable()
export class FileService implements IFileService {
	/**
	 * The entity manager for executing transactions on repositories.
	 * @type {EntityManager}
	 */
	private readonly entityManager: EntityManager;

	/**
	 * The config service for using environment variables.
	 * @type {ConfigService}
	 */
	private readonly configService: ConfigService;

	/**
	 * The repository for executing file operations on the db.
	 * @type {IFileRepository}
	 */
	private readonly fileRepository: IFileRepository;

	/**
	 * The repository for executing directory operations on the db.
	 * @type {IDirectoryRepository}
	 */
	private readonly directoryRepository: IDirectoryRepository;

	/**
	 * Creates a new FileService instance.
	 * @constructor
	 *
	 * @param   {EntityManager}        entityManager       the entityManager
	 * @param   {ConfigService}        configService       the configService
	 * @param   {IFileRepository}      fileRepository      the fileRepository
	 * @param   {IDirectoryRepository} directoryRepository the directoryRepository
	 * @returns {FileService}                              the FileService instance
	 */
	public constructor(
		entityManager: EntityManager,
		configService: ConfigService,
		@Inject(IFileRepository) fileRepository: IFileRepository,
		@Inject(IDirectoryRepository) directoryRepository: IDirectoryRepository
	) {
		this.entityManager = entityManager;
		this.configService = configService;
		this.fileRepository = fileRepository;
		this.directoryRepository = directoryRepository;
	}

	/**
	 * Uploads a file.
	 * Throws if it already exists or destination parent does not exist.
	 * @async
	 *
	 * @throws  {ServerError} file must not already exist
	 * @throws  {ServerError} parent directory must exist
	 *
	 * @param   {FileUploadDto}               fileUploadDto the dto for uploading a new file
	 * @returns {Promise<FileUploadResponse>}               the path of the uploaded file
	 */
	public async upload(fileUploadDto: FileUploadDto): Promise<FileUploadResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (await this.fileRepository.exists(entityManager, fileUploadDto.path)) {
				throw new ServerError(`file ${fileUploadDto.path} already exists`, HttpStatus.CONFLICT);
			}

			const parentPath = path.dirname(fileUploadDto.path);
			const hasRootAsParent = path.relative('.', parentPath) === '';

			const parent = await this.directoryRepository.select(entityManager, parentPath);

			if (!parent && !hasRootAsParent) {
				throw new ServerError(`directory ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const parentId = hasRootAsParent ? 'root' : parent!.id;

			const fileName = path.basename(fileUploadDto.path);
			const result = await this.fileRepository.insertReturningId(entityManager, fileName, fileUploadDto.mimeType, fileUploadDto.size, parentId);

			const resolvedPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(result.id), StoragePath.Data);
			await FileUtils.writeFile(resolvedPath, fileUploadDto.stream);

			return FileUploadResponse.from(fileUploadDto.path);
		});
	}

	/**
	 * Uploads a file or replace if it already exists.
	 * Throws if the destination parent does not exist.
	 * @async
	 *
	 * @throws  {ServerError} parent directory must exist
	 *
	 * @param   {FileReplaceDto}               fileReplaceDto the dto for uploading or replacing a file
	 * @returns {Promise<FileReplaceResponse>}                the path of the created file
	 */
	public async replace(fileReplaceDto: FileReplaceDto): Promise<FileReplaceResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const parentPath = path.dirname(fileReplaceDto.path);
			const parentDirectory = await this.directoryRepository.select(entityManager, parentPath);

			if (!parentDirectory) {
				throw new ServerError(`directory ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			if (await this.fileRepository.exists(entityManager, fileReplaceDto.path)) {
				await this.fileRepository.deleteByPath(entityManager, fileReplaceDto.path);
			}

			const fileName = path.basename(fileReplaceDto.path);
			const result = await this.fileRepository.insertReturningId(
				entityManager,
				fileName,
				fileReplaceDto.mimeType,
				fileReplaceDto.size,
				parentDirectory.id
			);

			const resolvedPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(result.id), StoragePath.Data);
			await FileUtils.writeFile(resolvedPath, fileReplaceDto.stream);

			return FileReplaceResponse.from(fileReplaceDto.path);
		});
	}

	/**
	 * Returns the metadata of a file.
	 * Throws if the file does not exists.
	 * @async
	 *
	 * @throws  {ServerError} file must exist
	 *
	 * @param   {FileMetadataDto}               fileMetadataDto the dto for getting the metadata of a file
	 * @returns {Promise<FileMetadataResponse>}                 the metadata
	 */
	public async metadata(fileMetadataDto: FileMetadataDto): Promise<FileMetadataResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const metadata = await this.fileRepository.getMetadata(entityManager, fileMetadataDto.path);

			if (!metadata) {
				throw new ServerError(`file ${fileMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileMetadataResponse.from({ path: fileMetadataDto.path, ...metadata });
		});
	}

	/**
	 * Returns a stream of the content of a file as well as mimeType and filename.
	 * Throws if the file does not exist.
	 * @async
	 *
	 * @throws  {ServerError} file must exist
	 *
	 * @param   {FileDownloadDto}               fileDownloadDto the dto for downloading a file
	 * @returns {Promise<FileDownloadResponse>}                 the response
	 */
	public async download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const fileToDownload = await this.fileRepository.select(entityManager, fileDownloadDto.path);

			if (!fileToDownload) {
				throw new ServerError(`file ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const diskPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(fileToDownload.id), StoragePath.Data);

			return FileDownloadResponse.from(fileToDownload.name, fileToDownload.mimeType, createReadStream(diskPath));
		});
	}

	/**
	 * Renames or moves a file.
	 * Throws if file does not exist, destination already exists or destination parent not exists.
	 * @async
	 *
	 * @throws  {ServerError} file must exist
	 * @throws  {ServerError} destination file must not already exist
	 * @throws  {ServerError} destination parent directory must exist
	 *
	 * @param   {FileRenameDto}               fileRenameDto the dto for renaming a file
	 * @returns {Promise<FileRenameResponse>}               the path of the renamed file
	 */
	public async rename(fileRenameDto: FileRenameDto): Promise<FileRenameResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			if (await this.fileRepository.exists(entityManager, fileRenameDto.destinationPath)) {
				throw new ServerError(`file ${fileRenameDto.destinationPath} already exists`, HttpStatus.CONFLICT);
			}

			if (!(await this.fileRepository.exists(entityManager, fileRenameDto.sourcePath))) {
				throw new ServerError(`file ${fileRenameDto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const willFileNameChange = path.basename(fileRenameDto.destinationPath) !== path.basename(fileRenameDto.sourcePath);
			let updateOptions: {
				name?: string;
				parentId?: string;
			} = willFileNameChange ? { name: path.basename(fileRenameDto.destinationPath) } : {};

			if (path.dirname(fileRenameDto.sourcePath) === path.dirname(fileRenameDto.destinationPath)) {
				if (willFileNameChange) {
					await this.fileRepository.update(entityManager, fileRenameDto.sourcePath, updateOptions);
				}

				return FileRenameResponse.from(fileRenameDto.destinationPath);
			}

			const destParentPath = path.dirname(fileRenameDto.destinationPath);
			const hasRootAsParent = path.relative('.', destParentPath) === '';

			const destinationParent = hasRootAsParent ? { id: 'root' } : await this.directoryRepository.select(entityManager, destParentPath);

			if (!destinationParent) {
				throw new ServerError(`directory ${destParentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			updateOptions = {
				...updateOptions,
				parentId: destinationParent.id,
			};

			await this.fileRepository.update(entityManager, fileRenameDto.sourcePath, updateOptions);

			return FileRenameResponse.from(fileRenameDto.destinationPath);
		});
	}

	/**
	 * Deletes a file by its path.
	 * Throws if file at given path does not exist.
	 * @async
	 *
	 * @throws  {ServerError} file must exist
	 *
	 * @param   {FileDeleteDto}               fileDeleteDto the dto for soft deleting the file
	 */
	public async delete(fileDeleteDto: FileDeleteDto): Promise<void> {
		return await this.entityManager.transactional(async (entityManager) => {
			const file = await this.fileRepository.select(entityManager, fileDeleteDto.path);

			if (!file) {
				throw new ServerError(`file ${fileDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.fileRepository.deleteById(entityManager, file.id);
		});
	}
}
