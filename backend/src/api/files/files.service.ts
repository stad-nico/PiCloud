import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { FileDownloadDto, FileMetadataDto, FileUploadDto } from 'src/api/files/dtos';
import { File } from 'src/api/files/entities/file.entity';
import { FileDownloadResponse, FileMetadataResponse, FileUploadResponse } from 'src/api/files/responses';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';
import { withTransactionalQueryRunner } from 'src/util/withTransactionalQueryRunner';

import { createReadStream } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileDeleteDto } from './dtos/file.delete.dto';
import { FileDeleteResponse } from './responses/file.delete.response';

@Injectable()
export class FilesService {
	private readonly dataSource: DataSource;

	private readonly configService: ConfigService;

	constructor(dataSource: DataSource, configService: ConfigService) {
		this.dataSource = dataSource;
		this.configService = configService;
	}

	public async upload(fileUploadDto: FileUploadDto): Promise<FileUploadResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			if (await runner.manager.exists(File, { where: { fullPath: fileUploadDto.fullPath } })) {
				throw new ServerError(`file at ${fileUploadDto.fullPath} already exists`, HttpStatus.CONFLICT);
			}

			const result = await runner.manager.save(fileUploadDto.toFile());

			if (!FileUtils.isPathRelative(this.configService, fileUploadDto.fullPath)) {
				throw new ServerError(`path must be a valid file path`, HttpStatus.BAD_REQUEST);
			}

			const resolvedPath = await FileUtils.join(this.configService, fileUploadDto.fullPath);

			if (await FileUtils.pathExists(resolvedPath)) {
				throw new ServerError(`file at ${fileUploadDto.fullPath} already exists`, HttpStatus.CONFLICT);
			}

			try {
				if (!(await FileUtils.pathExists(path.dirname(resolvedPath)))) {
					await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
				}

				await fs.writeFile(resolvedPath, fileUploadDto.buffer);
			} catch (e) {
				throw new Error('could not create file');
			}

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

			const diskPath = FileUtils.join(this.configService, file.fullPath);

			if (!(await FileUtils.pathExists(diskPath))) {
				throw new ServerError(`file at ${fileDownloadDto.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileDownloadResponse.from(file.name, file.mimeType, createReadStream(diskPath));
		});
	}

	public async delete(fileDeleteDto: FileDeleteDto): Promise<FileDeleteResponse> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			const fullPath = FileUtils.join(this.configService, fileDeleteDto.path);

			if (await FileUtils.pathExists(fullPath)) {
				try {
					await fs.rm(fullPath);
				} catch (e) {
					throw new Error("could not delete file")
				}
			}

			if (await runner.manager.exists(File, {where: {fullPath: fileDeleteDto.path}})) {
				await runner.manager.delete(File, {fullPath: fileDeleteDto.path});
			}

			return new FileDeleteResponse();	
		})
	}
}