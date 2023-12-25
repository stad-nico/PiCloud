import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Environment } from 'src/env.config';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';

import { FileDeleteDto, FileDeleteResponse } from 'src/api/file/mapping/delete';
import { FileDownloadDto, FileDownloadResponse } from 'src/api/file/mapping/download';
import { FileMetadataDto, FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileUploadDto, FileUploadResponse } from 'src/api/file/mapping/upload';

import { createReadStream } from 'fs';
import * as fsPromises from 'fs/promises';
import { lookup } from 'mime-types';
import * as path from 'path';
import { FileRenameDto, FileRenameResponse } from 'src/api/file/mapping/rename';
import { FileRestoreDto, FileRestoreResponse } from 'src/api/file/mapping/restore';
import { IDirectoryRepository } from 'src/api/file/repositories/DirectoryRepository';
import { IFileRepository } from 'src/api/file/repositories/FileRepository';

@Injectable()
export class FileService {
	private readonly logger = new Logger(FileService.name);

	private readonly configService: ConfigService;

	private readonly fileRepository: IFileRepository;

	private readonly directoryRepository: IDirectoryRepository;

	constructor(
		configService: ConfigService,
		@Inject(IFileRepository) fileRepository: IFileRepository,
		@Inject(IDirectoryRepository) directoryRepository: IDirectoryRepository
	) {
		this.configService = configService;
		this.fileRepository = fileRepository;
		this.directoryRepository = directoryRepository;
	}

	public async upload(fileUploadDto: FileUploadDto, overwrite: boolean = false): Promise<FileUploadResponse> {
		return await this.fileRepository.transactional(async (connection) => {
			const parent = await this.directoryRepository.getUuidByPathAndNotRecycled(connection, fileUploadDto.path);

			if (!parent) {
				throw new ServerError(`directory at ${fileUploadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const fullPath = path.join(fileUploadDto.path, fileUploadDto.name);
			const existingFile = await this.fileRepository.getUuidByPathAndNotRecycled(connection, fullPath);

			if (!overwrite && existingFile) {
				throw new ServerError(`file at ${fullPath} already exists`, HttpStatus.CONFLICT);
			}

			if (!FileUtils.isPathRelative(this.configService, fullPath)) {
				throw new ServerError(`path must be a valid file path`, HttpStatus.BAD_REQUEST);
			}

			if (overwrite && existingFile) {
				await this.fileRepository.hardDeleteByUuid(connection, existingFile.uuid);

				try {
					const existingFilePath = FileUtils.join(
						this.configService,
						FileUtils.uuidToDirPath(existingFile.uuid),
						Environment.DiskStoragePath
					);

					await fsPromises.rm(existingFilePath);
				} catch (e) {
					this.logger.warn(`Failed to delete file ${existingFile.uuid} from save location: ${e}`);
				}
			}

			const result = await this.fileRepository.insertAndSelectUuidAndPath(connection, fileUploadDto.toFile(parent.uuid));

			if (!result) {
				throw new Error('inserting entity into db failed');
			}

			const resolvedPath = FileUtils.join(this.configService, FileUtils.uuidToDirPath(result.uuid), Environment.DiskStoragePath);
			await FileUtils.writeFile(resolvedPath, fileUploadDto.buffer);

			return FileUploadResponse.from(result.path);
		});
	}

	public async metadata(fileMetadataDto: FileMetadataDto): Promise<FileMetadataResponse> {
		return await this.fileRepository.transactional(async (connection) => {
			const fileToFetch = await this.fileRepository.getFullEntityByPathAndNotRecycled(connection, fileMetadataDto.path);

			if (!fileToFetch) {
				throw new ServerError(`file at ${fileMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileMetadataResponse.from(fileToFetch);
		});
	}

	public async download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse> {
		return await this.fileRepository.transactional(async (connection) => {
			const fileToDownload = await this.fileRepository.getByPathAndNotRecycled(connection, fileDownloadDto.path);

			if (!fileToDownload) {
				throw new ServerError(`file at ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const diskPath = FileUtils.join(this.configService, FileUtils.uuidToDirPath(fileToDownload.uuid), Environment.DiskStoragePath);

			if (!(await FileUtils.pathExists(diskPath))) {
				throw new ServerError(`file at ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileDownloadResponse.from(fileToDownload.name, fileToDownload.mimeType, createReadStream(diskPath));
		});
	}

	public async delete(fileDeleteDto: FileDeleteDto): Promise<FileDeleteResponse> {
		return await this.fileRepository.transactional(async (connection) => {
			const fileToDelete = await this.fileRepository.getUuidByPathAndNotRecycled(connection, fileDeleteDto.path);

			if (!fileToDelete) {
				throw new ServerError(`file at ${fileDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.fileRepository.softDeleteByUuid(connection, fileToDelete.uuid);

			const sourcePath = FileUtils.join(this.configService, FileUtils.uuidToDirPath(fileToDelete.uuid), Environment.DiskStoragePath);
			const destinationPath = FileUtils.join(
				this.configService,
				FileUtils.uuidToDirPath(fileToDelete.uuid),
				Environment.DiskRecyclePath
			);
			await FileUtils.copyFile(sourcePath, destinationPath);

			try {
				await fsPromises.rm(sourcePath);
			} catch (e) {
				this.logger.warn(`Failed to delete file ${fileToDelete.uuid} from recycle location: ${e}`);
			}

			return FileDeleteResponse.from(fileToDelete.uuid);
		});
	}

	public async restore(fileRestoreDto: FileRestoreDto, overwrite: boolean = false): Promise<FileRestoreResponse> {
		return await this.fileRepository.transactional(async (connection) => {
			const fileToRestore = await this.fileRepository.getPathByUuidAndRecycled(connection, fileRestoreDto.uuid);

			if (!fileToRestore) {
				throw new ServerError(`uuid ${fileRestoreDto.uuid} does not exist`, HttpStatus.NOT_FOUND);
			}

			const existingFile = await this.fileRepository.getUuidByPathAndNotRecycled(connection, fileToRestore.path);

			if (!overwrite && existingFile) {
				throw new ServerError(`file at ${fileToRestore.path} already exists`, HttpStatus.CONFLICT);
			}

			if (overwrite && existingFile) {
				await this.fileRepository.hardDeleteByUuid(connection, existingFile.uuid);
			}

			await this.fileRepository.restoreByUuid(connection, fileRestoreDto.uuid);

			const dirPath = FileUtils.uuidToDirPath(fileRestoreDto.uuid);
			const sourcePath = FileUtils.join(this.configService, dirPath, Environment.DiskRecyclePath);
			const destinationPath = FileUtils.join(this.configService, dirPath, Environment.DiskStoragePath);
			await FileUtils.copyFile(sourcePath, destinationPath);

			try {
				await fsPromises.rm(sourcePath);
			} catch (e) {
				this.logger.warn(`Failed to delete file ${fileRestoreDto.uuid} (${fileToRestore.path}) from recycle location: ${e}`);
			}

			return FileRestoreResponse.from(fileToRestore as any);
		});
	}

	public async rename(fileRenameDto: FileRenameDto, overwrite: boolean = false): Promise<FileRenameResponse> {
		return await this.fileRepository.transactional(async (connection) => {
			const fileToRename = await this.fileRepository.getSizeAndUuidByPathAndNotRecycled(connection, fileRenameDto.sourcePath);

			if (!fileToRename) {
				throw new ServerError(`file at ${fileRenameDto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const existingFile = await this.fileRepository.getUuidByPathAndNotRecycled(connection, fileRenameDto.destinationPath);

			if (!FileUtils.isPathRelative(this.configService, fileRenameDto.destinationPath)) {
				throw new ServerError(`newPath must be a valid file path`, HttpStatus.BAD_REQUEST);
			}

			if (!overwrite && existingFile) {
				throw new ServerError(`file at ${fileRenameDto.destinationPath} already exists`, HttpStatus.CONFLICT);
			}

			if (overwrite && existingFile) {
				await this.fileRepository.hardDeleteByUuid(connection, existingFile.uuid);
			}

			const file: any = {
				uuid: fileToRename.uuid,
				name: path.basename(fileRenameDto.destinationPath),
				mimeType: lookup(fileRenameDto.destinationPath) || 'application/octet-stream',
				size: fileToRename.size,
				isRecycled: false,
			};

			// const result = await this.fileRepository.upsert(File, file);
			const result: any = 0;

			return FileRenameResponse.from(result);
		});
	}
}
