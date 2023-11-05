import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { File } from 'src/api/files/entities/file.entity';
import { RecycledFile } from 'src/api/files/entities/recycledFile.entity';
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
			if (!override && (await runner.manager.exists(File, { where: { fullPath: fileUploadDto.fullPath } }))) {
				throw new ServerError(`file at ${fileUploadDto.fullPath} already exists`, HttpStatus.CONFLICT);
			}

			const result = await runner.manager.save(fileUploadDto.toFile());

			if (!FileUtils.isPathRelative(this.configService, fileUploadDto.fullPath)) {
				throw new ServerError(`path must be a valid file path`, HttpStatus.BAD_REQUEST);
			}

			const resolvedPath = await FileUtils.join(this.configService, result.getUuidAsDirPath(), Environment.DiskStoragePath);

			await FileUtils.writeFile(resolvedPath, fileUploadDto.buffer);

			return FileUploadResponse.fromFile(result);
		});
	}

	public async getMetadata(fileMetadataDto: FileMetadataDto): Promise<FileMetadataResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const file: File | null = await runner.manager.findOne(File, { where: { fullPath: fileMetadataDto.path } });

			if (!file) {
				throw new ServerError(`file at ${fileMetadataDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileMetadataResponse.from(file);
		});
	}

	public async download(fileDownloadDto: FileDownloadDto): Promise<FileDownloadResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const file: File | null = await runner.manager.findOne(File, { where: { fullPath: fileDownloadDto.path } });

			if (!file) {
				throw new ServerError(`file at ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const diskPath = FileUtils.join(this.configService, file.getUuidAsDirPath(), Environment.DiskStoragePath);

			if (!(await FileUtils.pathExists(diskPath))) {
				throw new ServerError(`file at ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileDownloadResponse.from(file.name, file.mimeType, createReadStream(diskPath));
		});
	}

	public async delete(fileDeleteDto: FileDeleteDto): Promise<FileDeleteResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const file: File | null = await runner.manager.findOne(File, { where: { fullPath: fileDeleteDto.path } });

			if (!file) {
				throw new ServerError(`file at ${fileDeleteDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			const recycledFile: RecycledFile = RecycledFile.fromFile(file);

			await runner.manager.delete(File, { fullPath: fileDeleteDto.path });
			await runner.manager.save(recycledFile);

			const sourcePath = FileUtils.join(this.configService, file.getUuidAsDirPath(), Environment.DiskStoragePath);
			const destinationPath = FileUtils.join(this.configService, recycledFile.getUuidAsDirPath(), Environment.DiskRecyclePath);
			await FileUtils.copyFile(sourcePath, destinationPath);

			return FileDeleteResponse.fromRecycledFile(recycledFile);
		});
	}

	public async restore(fileRestoreDto: FileRestoreDto, override: boolean = false): Promise<FileRestoreResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const recycledFile: RecycledFile | null = await runner.manager.findOne(RecycledFile, { where: { uuid: fileRestoreDto.uuid } });

			if (!recycledFile) {
				throw new ServerError(`uuid ${fileRestoreDto.uuid} does not exist`, HttpStatus.NOT_FOUND);
			}

			if (!override && (await runner.manager.exists(File, { where: { fullPath: recycledFile.origin } }))) {
				throw new ServerError(`file at ${recycledFile.origin} already exists`, HttpStatus.CONFLICT);
			}

			await runner.manager.delete(RecycledFile, { uuid: fileRestoreDto.uuid });
			const result = await runner.manager.save(File, recycledFile.toFile());

			const sourcePath = FileUtils.join(this.configService, recycledFile.getUuidAsDirPath(), Environment.DiskRecyclePath);
			const destinationPath = FileUtils.join(this.configService, recycledFile.origin, Environment.DiskStoragePath);

			await FileUtils.copyFile(sourcePath, destinationPath);
			await fsPromises.rm(sourcePath);

			return FileRestoreResponse.fromFile(result);
		});
	}

	public async rename(fileRenameDto: FileRenameDto, override: boolean = false): Promise<FileRenameResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const file: File | null = await runner.manager.findOne(File, { where: { fullPath: fileRenameDto.sourcePath } });

			if (!file) {
				throw new ServerError(`file at ${fileRenameDto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);
			}

			if (!override && (await runner.manager.exists(File, { where: { fullPath: fileRenameDto.destinationPath } }))) {
				throw new ServerError(`file at ${fileRenameDto.destinationPath} already exists`, HttpStatus.CONFLICT);
			}

			await runner.manager.delete(File, { fullPath: fileRenameDto.destinationPath });
			const result = await runner.manager.save(
				File,
				new File(
					fileRenameDto.destinationPath,
					path.basename(fileRenameDto.destinationPath),
					path.dirname(fileRenameDto.destinationPath),
					lookup(path.extname(fileRenameDto.destinationPath)) || 'application/octet-stream',
					file.size,
					file.uuid
				)
			);

			return FileRenameResponse.from(result);
		});
	}
}
