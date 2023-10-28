import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { FileMetadataResponseDto } from 'src/api/files/dtos/file.metadata.response.dto';
import { FileUploadResponseDto } from 'src/api/files/dtos/file.upload.response.dto';
import { File } from 'src/api/files/entities/file.entity';
import { FileMetadataEntity } from 'src/api/files/entities/file.metadata.entity';
import { FileUploadEntity } from 'src/api/files/entities/file.upload.entity';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';
import { withTransactionalQueryRunner } from 'src/util/withTransactionalQueryRunner';

import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FilesService {
	private readonly logger = new Logger(FilesService.name);

	private readonly dataSource: DataSource;

	private readonly configService: ConfigService;

	constructor(dataSource: DataSource, configService: ConfigService) {
		this.dataSource = dataSource;
		this.configService = configService;
	}

	public async upload(fileUploadEntity: FileUploadEntity): Promise<FileUploadResponseDto> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			if (await runner.manager.exists(File, { where: { fullPath: fileUploadEntity.fullPath } })) {
				throw new ServerError(`file at ${fileUploadEntity.fullPath} already exists`, HttpStatus.CONFLICT);
			}

			let result = await runner.manager.save(fileUploadEntity.toFile());

			if (!FileUtils.isPathRelative(this.configService, fileUploadEntity.fullPath)) {
				throw new ServerError(`path must be a valid file path`, HttpStatus.BAD_REQUEST);
			}

			let resolvedPath = await FileUtils.join(this.configService, fileUploadEntity.fullPath);

			if (await FileUtils.pathExists(resolvedPath)) {
				throw new ServerError(`file at ${fileUploadEntity.fullPath} already exists`, HttpStatus.CONFLICT);
			}

			try {
				if (!(await FileUtils.pathExists(path.dirname(resolvedPath)))) {
					await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
				}

				await fs.writeFile(resolvedPath, fileUploadEntity.buffer);
			} catch (e) {
				throw new Error('could not create file');
			}

			return FileUploadResponseDto.fromFile(result);
		});
	}

	public async getMetadata(fileMetadataEntity: FileMetadataEntity): Promise<FileMetadataResponseDto> {
		return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
			let file: File | null = await runner.manager.findOne(File, { where: { fullPath: fileMetadataEntity.path } });

			if (!file) {
				throw new ServerError(`file at ${fileMetadataEntity.path} does not exist`, HttpStatus.NOT_FOUND);
			}

			return FileMetadataResponseDto.from(file);
		});
	}
}
