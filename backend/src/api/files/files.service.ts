import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { File } from 'src/api/files/entities/file.entity';
import { Environment } from 'src/env.config';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';
import { withTransactionalQueryRunner } from 'src/util/withTransactionalQueryRunner';

import { FileDeleteDto, FileDeleteResponse } from 'src/api/files/classes/delete';
import { FileDownloadDto, FileDownloadResponse } from 'src/api/files/classes/download';
import { FileMetadataDto, FileMetadataResponse } from 'src/api/files/classes/metadata';
import { FileRenameDto, FileRenameResponse } from 'src/api/files/classes/rename';
import { FileRestoreDto, FileRestoreResponse } from 'src/api/files/classes/restore';
import { FileUploadDto, FileUploadResponse } from 'src/api/files/classes/upload';

import { createReadStream } from 'fs';
import * as fsPromises from 'fs/promises';
import { lookup } from 'mime-types';
import * as path from 'path';

@Injectable()
export class FilesService {
	private readonly dataSource: DataSource;

	private readonly configService: ConfigService;

	constructor(dataSource: DataSource, configService: ConfigService) {
		this.dataSource = dataSource;
		this.configService = configService;
	}

	public async upload(fileUploadDto: FileUploadDto, override: boolean = false): Promise<FileUploadResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const existingFile: File | null = await runner.manager.findOne(File, {
				where: { fullPath: fileUploadDto.fullPath, isRecycled: false },
			});

			if (!override && existingFile) {
				throw new ServerError(`file at ${fileUploadDto.fullPath} already exists`, HttpStatus.CONFLICT);
			}

			if (override && existingFile) {
				await runner.manager.delete(File, { uuid: existingFile.uuid });
			}

			const result = await runner.manager.save(File, fileUploadDto.toFile());

			if (!FileUtils.isPathRelative(this.configService, fileUploadDto.fullPath)) {
				throw new ServerError(`path must be a valid file path`, HttpStatus.BAD_REQUEST);
			}

			const resolvedPath = FileUtils.join(this.configService, result.getUuidAsDirPath(), Environment.DiskStoragePath);
			await FileUtils.writeFile(resolvedPath, fileUploadDto.buffer);

			return FileUploadResponse.fromFile(result);
		});
	}

	public async metadata(fileMetadataDto: FileMetadataDto): Promise<FileMetadataResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const fileToFetch: File | null = await runner.manager.findOne(File, {
				where: { fullPath: fileMetadataDto.path, isRecycled: false },
			});

			if (!fileToFetch) {
				throw new ServerError(`file at ${fileMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileMetadataResponse.from(fileToFetch);
		});
	}

	public async download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const fileToDownload: File | null = await runner.manager.findOne(File, {
				where: { fullPath: fileDownloadDto.path, isRecycled: false },
			});

			if (!fileToDownload) {
				throw new ServerError(`file at ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const diskPath = FileUtils.join(this.configService, fileToDownload.getUuidAsDirPath(), Environment.DiskStoragePath);

			if (!(await FileUtils.pathExists(diskPath))) {
				throw new ServerError(`file at ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileDownloadResponse.from(fileToDownload.name, fileToDownload.mimeType, createReadStream(diskPath));
		});
	}

	public async delete(fileDeleteDto: FileDeleteDto): Promise<FileDeleteResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const fileToDelete: File | null = await runner.manager.findOne(File, {
				where: { fullPath: fileDeleteDto.path, isRecycled: false },
			});

			if (!fileToDelete) {
				throw new ServerError(`file at ${fileDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			await runner.manager.update(File, { uuid: fileToDelete.uuid }, { isRecycled: true });

			const sourcePath = FileUtils.join(this.configService, fileToDelete.getUuidAsDirPath(), Environment.DiskStoragePath);
			const destinationPath = FileUtils.join(this.configService, fileToDelete.getUuidAsDirPath(), Environment.DiskRecyclePath);
			await FileUtils.copyFile(sourcePath, destinationPath);
			await fsPromises.rm(sourcePath);

			return FileDeleteResponse.from(fileToDelete);
		});
	}

	public async restore(fileRestoreDto: FileRestoreDto, override: boolean = false): Promise<FileRestoreResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const fileToRestore: File | null = await runner.manager.findOne(File, {
				where: { uuid: fileRestoreDto.uuid, isRecycled: true },
			});

			if (!fileToRestore) {
				throw new ServerError(`uuid ${fileRestoreDto.uuid} does not exist`, HttpStatus.NOT_FOUND);
			}

			const existingFile: File | null = await runner.manager.findOne(File, {
				where: { fullPath: fileToRestore.fullPath, isRecycled: false },
			});

			if (!override && existingFile) {
				throw new ServerError(`file at ${fileToRestore.fullPath} already exists`, HttpStatus.CONFLICT);
			}

			if (override && existingFile) {
				await runner.manager.delete(File, { uuid: existingFile.uuid });
			}

			await runner.manager.update(File, { uuid: fileToRestore.uuid }, { isRecycled: false });

			const sourcePath = FileUtils.join(this.configService, fileToRestore.getUuidAsDirPath(), Environment.DiskRecyclePath);
			const destinationPath = FileUtils.join(this.configService, fileToRestore.getUuidAsDirPath(), Environment.DiskStoragePath);
			await FileUtils.copyFile(sourcePath, destinationPath);
			await fsPromises.rm(sourcePath);

			return FileRestoreResponse.from(fileToRestore);
		});
	}

	public async rename(fileRenameDto: FileRenameDto, override: boolean = false): Promise<FileRenameResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const fileToRename: File | null = await runner.manager.findOne(File, {
				where: { fullPath: fileRenameDto.sourcePath, isRecycled: false },
			});

			if (!fileToRename) {
				throw new ServerError(`file at ${fileRenameDto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);
			}

			const existingFile: File | null = await runner.manager.findOne(File, {
				where: { fullPath: fileRenameDto.destinationPath, isRecycled: false },
			});

			if (!override && existingFile) {
				throw new ServerError(`file at ${fileRenameDto.destinationPath} already exists`, HttpStatus.CONFLICT);
			}

			if (override && existingFile) {
				await runner.manager.delete(File, { uuid: existingFile.uuid });
			}

			const result = await runner.manager.save(
				File,
				new File(
					fileRenameDto.destinationPath,
					path.basename(fileRenameDto.destinationPath),
					path.dirname(fileRenameDto.destinationPath),
					lookup(fileRenameDto.destinationPath) || 'application/octet-stream',
					fileToRename.size,
					false,
					fileToRename.uuid
				)
			);

			return FileRenameResponse.from(result);
		});
	}
}
