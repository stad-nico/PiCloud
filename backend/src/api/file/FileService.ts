import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import * as path from 'path';
import { DirectoryRepository } from 'src/api/directory/DirectoryRepository';
import { DirectoryDeleteResponse } from 'src/api/directory/mapping/delete';
import { FileRepository } from 'src/api/file/FileRepository';
import { FileDeleteDto, FileDeleteResponse } from 'src/api/file/mapping/delete';
import { FileDownloadDto, FileDownloadResponse } from 'src/api/file/mapping/download';
import { FileMetadataDto, FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileRenameDto, FileRenameResponse } from 'src/api/file/mapping/rename';
import { FileRestoreDto, FileRestoreResponse } from 'src/api/file/mapping/restore';
import { FileUploadDto, FileUploadResponse } from 'src/api/file/mapping/upload';
import { Directory } from 'src/db/entities/Directory';
import { StoragePath } from 'src/disk/DiskService';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';
import { ServerError } from 'src/util/ServerError';
import { DataSource } from 'typeorm';

@Injectable()
export class FileService {
	private readonly repository: FileRepository;

	private readonly dataSource: DataSource;

	private readonly configService: ConfigService;

	private readonly directoryRepository: DirectoryRepository;

	public constructor(
		repository: FileRepository,
		dataSource: DataSource,
		configService: ConfigService,
		directoryRepository: DirectoryRepository
	) {
		this.repository = repository;
		this.dataSource = dataSource;
		this.configService = configService;
		this.directoryRepository = directoryRepository;
	}

	public async upload(fileUploadDto: FileUploadDto): Promise<FileUploadResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			if ((await this.repository.exists(entityManager, fileUploadDto.path), false)) {
				throw new ServerError(`file at ${fileUploadDto.path} already exists`, HttpStatus.CONFLICT);
			}

			const parentPath = path.dirname(fileUploadDto.path);
			const parentDirectory = await this.directoryRepository.selectByPath(entityManager, parentPath, false);

			if (!parentDirectory) {
				throw new ServerError(`directory at ${parentPath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const fileName = path.basename(fileUploadDto.path);
			const result = await this.repository.insertReturningUuid(entityManager, fileName, fileUploadDto.mimeType, parentDirectory.uuid);

			const resolvedPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(result.uuid), StoragePath.Data);
			await FileUtils.writeFile(resolvedPath, fileUploadDto.buffer);

			return FileUploadResponse.from(fileUploadDto.path);
		});
	}

	public async delete(fileDeleteDto: FileDeleteDto): Promise<FileDeleteResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const file = await this.repository.selectByPath(entityManager, fileDeleteDto.path, false);

			if (!file) {
				throw new ServerError(`file at ${fileDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await this.repository.softDelete(entityManager, file.uuid);

			return DirectoryDeleteResponse.from(file.uuid);
		});
	}

	public async metadata(fileMetadataDto: FileMetadataDto): Promise<FileMetadataResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const metadata = await this.repository.getMetadata(entityManager, fileMetadataDto.path);

			if (!metadata) {
				throw new ServerError(`file at ${fileMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileMetadataResponse.from({ path: fileMetadataDto.path, ...metadata });
		});
	}

	public async download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			const fileToDownload = await this.repository.selectByPath(entityManager, fileDownloadDto.path);

			if (!fileToDownload) {
				throw new ServerError(`file at ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const diskPath = PathUtils.join(this.configService, PathUtils.uuidToDirPath(fileToDownload.uuid), StoragePath.Data);

			if (!(await PathUtils.pathExists(diskPath))) {
				throw new ServerError(`file at ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileDownloadResponse.from(fileToDownload.name, fileToDownload.mimeType, createReadStream(diskPath));
		});
	}

	public async rename(fileRenameDto: FileRenameDto): Promise<FileRenameResponse> {
		return await this.dataSource.transaction(async (entityManager) => {
			if (await this.repository.exists(entityManager, fileRenameDto.destinationPath, false)) {
				throw new ServerError(`file at ${fileRenameDto.destinationPath} already exists`, HttpStatus.CONFLICT);
			}

			if (!(await this.repository.exists(entityManager, fileRenameDto.sourcePath, false))) {
				throw new ServerError(`file at ${fileRenameDto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const destinationName = path.basename(fileRenameDto.destinationPath);

			let updateOptions: Partial<Directory> = { name: destinationName };

			if (path.dirname(fileRenameDto.sourcePath) === path.dirname(fileRenameDto.destinationPath)) {
				await this.repository.update(entityManager, fileRenameDto.sourcePath, updateOptions);

				return FileRenameResponse.from(fileRenameDto.destinationPath);
			}

			const destParentPath = path.dirname(fileRenameDto.destinationPath);
			const destinationParent = await this.directoryRepository.selectByPath(entityManager, destParentPath, false);

			if (!destinationParent) {
				throw new ServerError(`directory at ${destParentPath} does not exists`, HttpStatus.NOT_FOUND);
			}

			updateOptions = { ...updateOptions, parent: destinationParent.uuid };

			await this.repository.update(entityManager, fileRenameDto.sourcePath, updateOptions);

			return FileRenameResponse.from(fileRenameDto.destinationPath);
		});
	}

	public async restore(fileRestoreDto: FileRestoreDto): Promise<FileRestoreResponse> {}
}

// 	public async restore(fileRestoreDto: FileRestoreDto, overwrite: boolean = false): Promise<FileRestoreResponse> {
// 		return await this.fileRepository.transactional(async (connection) => {
// 			const fileToRestore = await this.fileRepository.getPathByUuidAndRecycled(connection, fileRestoreDto.uuid);

// 			if (!fileToRestore) {
// 				throw new ServerError(`uuid ${fileRestoreDto.uuid} does not exist`, HttpStatus.NOT_FOUND);
// 			}

// 			const existingFile = await this.fileRepository.getUuidByPathAndNotRecycled(connection, fileToRestore.path);

// 			if (!overwrite && existingFile) {
// 				throw new ServerError(`file at ${fileToRestore.path} already exists`, HttpStatus.CONFLICT);
// 			}

// 			if (overwrite && existingFile) {
// 				await this.fileRepository.hardDeleteByUuid(connection, existingFile.uuid);
// 			}

// 			await this.fileRepository.restoreByUuid(connection, fileRestoreDto.uuid);

// 			const dirPath = PathUtils.uuidToDirPath(fileRestoreDto.uuid);
// 			const sourcePath = PathUtils.join(this.configService, dirPath, StoragePath.Bin);
// 			const destinationPath = PathUtils.join(this.configService, dirPath, StoragePath.Data);
// 			await FileUtils.copyFile(sourcePath, destinationPath);

// 			try {
// 				await fsPromises.rm(sourcePath);
// 			} catch (e) {
// 				this.logger.warn(`Failed to delete file ${fileRestoreDto.uuid} (${fileToRestore.path}) from recycle location: ${e}`);
// 			}

// 			return FileRestoreResponse.from(fileToRestore as any);
// 		});
// 	}
// }
