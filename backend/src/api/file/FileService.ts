import { createReadStream } from 'fs';
import * as path from 'path';

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EntityManager } from '@mikro-orm/mariadb';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { DirectoryDeleteResponse } from 'src/api/directory/mapping/delete';
import { IFileRepository } from 'src/api/file/IFileRepository';
import { FileDeleteDto, FileDeleteResponse } from 'src/api/file/mapping/delete';
import { FileDownloadDto, FileDownloadResponse } from 'src/api/file/mapping/download';
import { FileMetadataDto, FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileRenameDto, FileRenameResponse } from 'src/api/file/mapping/rename';
import { FileReplaceDto } from 'src/api/file/mapping/replace/FileReplaceDto';
import { FileReplaceResponse } from 'src/api/file/mapping/replace/FileReplaceResponse';
import { FileRestoreDto, FileRestoreResponse } from 'src/api/file/mapping/restore';
import { FileUploadDto, FileUploadResponse } from 'src/api/file/mapping/upload';
import { File } from 'src/db/entities/File';
import { StoragePath } from 'src/disk/DiskService';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';
import { ServerError } from 'src/util/ServerError';

/**
 * Service for CRUD operations on file entities.
 * @class
 */
@Injectable()
export class FileService {
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
	 * @param {EntityManager}        entityManager       the entityManager
	 * @param {ConfigService}        configService       the configService
	 * @param {IFileRepository}      fileRepository      the fileRepository
	 * @param {IDirectoryRepository} directoryRepository the directoryRepository
	 * @returns {FileService} the FileService instance
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
	 * Returns the metadata of a file.
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
	 * @async
	 *
	 * @throws  {ServerError} file must exist
	 *
	 * @param   {FileDownloadDto}               fileDownloadDto the dto for downloading a file
	 * @returns {Promise<FileDownloadResponse>}                 the response
	 */
	public async download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const fileToDownload = await this.fileRepository.selectByPath(entityManager, fileDownloadDto.path);

			if (!fileToDownload) {
				throw new ServerError(`file ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const diskPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(fileToDownload.id), StoragePath.Data);

			return FileDownloadResponse.from(fileToDownload.name, fileToDownload.mimeType, createReadStream(diskPath));
		});
	}

	/**
	 * Restore a soft deleted file by its id. Returns the path of the restored file.
	 * Throws if file does not exist.
	 * @async
	 *
	 * @throws  {ServerError} file must exist
	 *
	 * @param   {FileRestoreDto}               fileRestoreDto the dto for restoring a file
	 * @returns {Promise<FileRestoreResponse>}                the path of the restored file
	 */
	public async restore(fileRestoreDto: FileRestoreDto): Promise<FileRestoreResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const file = await this.fileRepository.selectByUuid(entityManager, fileRestoreDto.uuid, true);

			if (!file) {
				throw new ServerError(`file ${fileRestoreDto.uuid} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.fileRepository.restore(entityManager, fileRestoreDto.uuid);

			return FileRestoreResponse.from(file.path);
		});
	}

	/**
	 * Uploads a file. Fails if it already exists or destination parent does not exist.
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
			if (await this.fileRepository.exists(entityManager, fileUploadDto.path, false)) {
				throw new ServerError(`file ${fileUploadDto.path} already exists`, HttpStatus.CONFLICT);
			}

			const parentPath = path.dirname(fileUploadDto.path);
			const hasRootAsParent = path.relative('.', parentPath) === '';

			const parent = await this.directoryRepository.selectByPath(entityManager, parentPath, false);

			if (!parent && !hasRootAsParent) {
				throw new ServerError(`directory ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const parentId = hasRootAsParent ? null : parent!.id;

			const fileName = path.basename(fileUploadDto.path);
			const result = await this.fileRepository.insertReturningUuid(entityManager, fileName, fileUploadDto.mimeType, parentId);

			const resolvedPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(result.id), StoragePath.Data);
			await FileUtils.writeFile(resolvedPath, fileUploadDto.buffer);

			return FileUploadResponse.from(fileUploadDto.path);
		});
	}

	/**
	 * Uploads a file or replace if it already exists. Fails if the destination parent does not exist.
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
			const parentDirectory = await this.directoryRepository.selectByPath(entityManager, parentPath, false);

			if (!parentDirectory) {
				throw new ServerError(`directory ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			if (await this.fileRepository.exists(entityManager, fileReplaceDto.path, false)) {
				await this.fileRepository.hardDelete(entityManager, fileReplaceDto.path, false);
			}

			const fileName = path.basename(fileReplaceDto.path);
			const result = await this.fileRepository.insertReturningUuid(
				entityManager,
				fileName,
				fileReplaceDto.mimeType,
				parentDirectory.id
			);

			const resolvedPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(result.id), StoragePath.Data);
			await FileUtils.writeFile(resolvedPath, fileReplaceDto.buffer);

			return FileUploadResponse.from(fileReplaceDto.path);
		});
	}

	/**
	 * Renames or moves a file. Fails if file does not exist or destination already exists or destination parent not exists.
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
			if (await this.fileRepository.exists(entityManager, fileRenameDto.destinationPath, false)) {
				throw new ServerError(`file ${fileRenameDto.destinationPath} already exists`, HttpStatus.CONFLICT);
			}

			if (!(await this.fileRepository.exists(entityManager, fileRenameDto.sourcePath, false))) {
				throw new ServerError(`file ${fileRenameDto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const destinationName = path.basename(fileRenameDto.destinationPath);

			let updateOptions: Partial<File> = { name: destinationName };

			if (path.dirname(fileRenameDto.sourcePath) === path.dirname(fileRenameDto.destinationPath)) {
				await this.fileRepository.update(entityManager, fileRenameDto.sourcePath, updateOptions);

				return FileRenameResponse.from(fileRenameDto.destinationPath);
			}

			const destParentPath = path.dirname(fileRenameDto.destinationPath);
			const destinationParent = await this.directoryRepository.selectByPath(entityManager, destParentPath, false);

			if (!destinationParent) {
				throw new ServerError(`directory ${destParentPath} does not exists`, HttpStatus.NOT_FOUND);
			}

			updateOptions = { ...updateOptions, parent: entityManager.getReference(File, destinationParent.id) };

			await this.fileRepository.update(entityManager, fileRenameDto.sourcePath, updateOptions);

			return FileRenameResponse.from(fileRenameDto.destinationPath);
		});
	}

	/**
	 * Soft deletes a file or fails if it does not exist.
	 * @async
	 *
	 * @throws  {ServerError} file must exist
	 *
	 * @param   {FileDeleteDto}               fileDeleteDto the dto for soft deleting a file
	 * @returns {Promise<FileDeleteResponse>}               the id of the deleted file
	 */
	public async delete(fileDeleteDto: FileDeleteDto): Promise<FileDeleteResponse> {
		return await this.entityManager.transactional(async (entityManager) => {
			const file = await this.fileRepository.selectByPath(entityManager, fileDeleteDto.path, false);

			if (!file) {
				throw new ServerError(`file ${fileDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.fileRepository.softDelete(entityManager, file.id);

			return DirectoryDeleteResponse.from(file.id);
		});
	}
}
