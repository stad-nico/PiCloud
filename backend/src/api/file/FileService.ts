import { createReadStream } from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
import { Directory } from 'src/db/entities/Directory';
import { StoragePath } from 'src/disk/DiskService';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';
import { ServerError } from 'src/util/ServerError';

@Injectable()
export class FileService {
	public constructor(
		private readonly dataSource: DataSource,
		private readonly configService: ConfigService,
		@Inject(IFileRepository) private readonly fileRepository: IFileRepository,
		@Inject(IDirectoryRepository) private readonly directoryRepository: IDirectoryRepository
	) {}

	/**
	 * Get the metadata of a file.
	 * @async
	 *
	 * @param {FileMetadataDto} fileMetadataDto the dto for getting the metadata of a file
	 *
	 * @returns {Promise<FileMetadataResponse>} the response
	 */
	public async metadata(fileMetadataDto: FileMetadataDto): Promise<FileMetadataResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const metadata = await this.fileRepository.getMetadata(entityManager, fileMetadataDto.path);

			if (!metadata) {
				throw new ServerError(`file at ${fileMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileMetadataResponse.from({ path: fileMetadataDto.path, ...metadata });
		});
	}

	/**
	 * Download a file.
	 * @async
	 *
	 * @param {FileDownloadDto} fileDownloadDto the dto for downloading a file
	 *
	 * @returns {Promise<FileDownloadResponse>} the response
	 */
	public async download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const fileToDownload = await this.fileRepository.selectByPath(entityManager, fileDownloadDto.path);

			if (!fileToDownload) {
				throw new ServerError(`file at ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const diskPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(fileToDownload.uuid), StoragePath.Data);

			return FileDownloadResponse.from(fileToDownload.name, fileToDownload.mimeType, createReadStream(diskPath));
		});
	}

	/**
	 * Restore a soft deleted directory.
	 * @async
	 *
	 * @param {FileRestoreDto} fileRestoreDto the dto for restoring a file
	 *
	 * @returns {Promise<FileRestoreResponse>} the response
	 */
	public async restore(fileRestoreDto: FileRestoreDto): Promise<FileRestoreResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const file = await this.fileRepository.selectByUuid(entityManager, fileRestoreDto.uuid, true);

			if (!file) {
				throw new ServerError(`file ${fileRestoreDto.uuid} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.fileRepository.restore(entityManager, fileRestoreDto.uuid);

			return FileRestoreResponse.from(file.path);
		});
	}

	/**
	 * Upload a file or fail if it already exists or destination parent does not exist.
	 * @async
	 *
	 * @param {FileUploadDto} fileUploadDto the dto for uploading a new file
	 *
	 * @returns {Promise<FileUploadResponse>} the response
	 */
	public async upload(fileUploadDto: FileUploadDto): Promise<FileUploadResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			if ((await this.fileRepository.exists(entityManager, fileUploadDto.path), false)) {
				throw new ServerError(`file at ${fileUploadDto.path} already exists`, HttpStatus.CONFLICT);
			}

			const parentPath = path.dirname(fileUploadDto.path);
			const parentDirectory = await this.directoryRepository.selectByPath(entityManager, parentPath, false);

			if (!parentDirectory) {
				throw new ServerError(`directory at ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const fileName = path.basename(fileUploadDto.path);
			const result = await this.fileRepository.insertReturningUuid(
				entityManager,
				fileName,
				fileUploadDto.mimeType,
				parentDirectory.uuid
			);

			const resolvedPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(result.uuid), StoragePath.Data);
			await FileUtils.writeFile(resolvedPath, fileUploadDto.buffer);

			return FileUploadResponse.from(fileUploadDto.path);
		});
	}

	/**
	 * Upload a file or replace if it already exists. Fails if the destination parent does not exist.
	 * @async
	 *
	 * @param {FileReplaceDto} fileReplaceDto the dto for uploading or replacing a file
	 *
	 * @returns {Promise<FileReplaceResponse>} the response
	 */
	public async replace(fileReplaceDto: FileReplaceDto): Promise<FileReplaceResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const parentPath = path.dirname(fileReplaceDto.path);
			const parentDirectory = await this.directoryRepository.selectByPath(entityManager, parentPath, false);

			if (!parentDirectory) {
				throw new ServerError(`directory at ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			if (await this.fileRepository.exists(entityManager, fileReplaceDto.path, false)) {
				await this.fileRepository.hardDelete(entityManager, fileReplaceDto.path, false);
			}

			const fileName = path.basename(fileReplaceDto.path);
			const result = await this.fileRepository.insertReturningUuid(
				entityManager,
				fileName,
				fileReplaceDto.mimeType,
				parentDirectory.uuid
			);

			const resolvedPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(result.uuid), StoragePath.Data);
			await FileUtils.writeFile(resolvedPath, fileReplaceDto.buffer);

			return FileUploadResponse.from(fileReplaceDto.path);
		});
	}

	/**
	 * Rename or move a file.
	 * @async
	 *
	 * @param {FileRenameDto} fileRenameDto the dto for renaming a file
	 *
	 * @returns {Promise<FileRenameResponse>} the response
	 */
	public async rename(fileRenameDto: FileRenameDto): Promise<FileRenameResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			if (await this.fileRepository.exists(entityManager, fileRenameDto.destinationPath, false)) {
				throw new ServerError(`file at ${fileRenameDto.destinationPath} already exists`, HttpStatus.CONFLICT);
			}

			if (!(await this.fileRepository.exists(entityManager, fileRenameDto.sourcePath, false))) {
				throw new ServerError(`file at ${fileRenameDto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const destinationName = path.basename(fileRenameDto.destinationPath);

			let updateOptions: Partial<Directory> = { name: destinationName };

			if (path.dirname(fileRenameDto.sourcePath) === path.dirname(fileRenameDto.destinationPath)) {
				await this.fileRepository.update(entityManager, fileRenameDto.sourcePath, updateOptions);

				return FileRenameResponse.from(fileRenameDto.destinationPath);
			}

			const destParentPath = path.dirname(fileRenameDto.destinationPath);
			const destinationParent = await this.directoryRepository.selectByPath(entityManager, destParentPath, false);

			if (!destinationParent) {
				throw new ServerError(`directory at ${destParentPath} does not exists`, HttpStatus.NOT_FOUND);
			}

			updateOptions = { ...updateOptions, parent: destinationParent.uuid };

			await this.fileRepository.update(entityManager, fileRenameDto.sourcePath, updateOptions);

			return FileRenameResponse.from(fileRenameDto.destinationPath);
		});
	}

	/**
	 * Soft delete a file or fail if it does not exist.
	 * @async
	 *
	 * @param {FileDeleteDto} fileDeleteDto the dto for soft deleting a file
	 *
	 * @returns {Promise<FileDeleteResponse>} the response
	 */
	public async delete(fileDeleteDto: FileDeleteDto): Promise<FileDeleteResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const file = await this.fileRepository.selectByPath(entityManager, fileDeleteDto.path, false);

			if (!file) {
				throw new ServerError(`file at ${fileDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.fileRepository.softDelete(entityManager, file.uuid);

			return DirectoryDeleteResponse.from(file.uuid);
		});
	}
}
