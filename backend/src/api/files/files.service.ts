import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { File } from 'src/api/files/entities/file.entity';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';
import { withTransactionalQueryRunner } from 'src/util/withTransactionalQueryRunner';
import { DataSource } from 'typeorm';
import { FileUploadEntity } from './entities/file.upload.entity';

@Injectable()
export class FilesService {
	private readonly logger = new Logger(FilesService.name);

	private readonly dataSource: DataSource;

	private readonly configService: ConfigService;

	constructor(dataSource: DataSource, configService: ConfigService) {
		this.dataSource = dataSource;
		this.configService = configService;
	}

	public async upload(
		fileUploadEntity: FileUploadEntity
	): Promise<File | ServerError<HttpStatus.CONFLICT | HttpStatus.INTERNAL_SERVER_ERROR>> {
		try {
			return await withTransactionalQueryRunner(this.dataSource, async (runner) => {
				if (await runner.manager.exists(File, { where: { fullPath: fileUploadEntity.fullPath } })) {
					throw new ServerError(`file at ${fileUploadEntity.fullPath} already exists`, HttpStatus.CONFLICT);
				}

				let result = await runner.manager.save(fileUploadEntity.toFile());

				if (!FileUtils.isPathRelative(this.configService, fileUploadEntity.fullPath)) {
					throw new ServerError(`path ${fileUploadEntity.fullPath} is not a valid path`, HttpStatus.BAD_REQUEST);
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

				return result;
			});
		} catch (e) {
			this.logger.error(e);
			if (e instanceof ServerError) {
				return e;
			} else {
				return new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
	}
}
