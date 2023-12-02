import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';

import { File } from 'src/api/files/entities/file.entity';
import { configureApplication } from 'src/app.config';
import { AppModuleConfig } from 'src/app.module';
import { Environment } from 'src/env.config';
import { FileUtils } from 'src/util/FileUtils';

import { lookup } from 'mime-types';
import * as path from 'path';
import * as request from 'supertest';

describe('/files/', () => {
	let app: INestApplication;
	let dataSource: DataSource;
	let configService: ConfigService;
	let runner: QueryRunner;

	const apiPath = '/files/';

	beforeAll(async () => {
		const testingModule = await Test.createTestingModule(AppModuleConfig).compile();

		app = testingModule.createNestApplication();
		configureApplication(app);

		dataSource = testingModule.get(DataSource);
		configService = testingModule.get(ConfigService);

		runner = dataSource.createQueryRunner();

		await app.init();
	});

	afterAll(async () => {
		await runner.release();
		await dataSource.destroy();
		await app.close();
	});

	afterEach(async () => {
		jest.clearAllMocks();

		await dataSource.createQueryBuilder().delete().from(File).execute();

		await FileUtils.emptyDirectory(configService.getOrThrow(Environment.DiskStoragePath));
		await FileUtils.emptyDirectory(configService.getOrThrow(Environment.DiskRecyclePath));
	});

	describe('POST /files/:path', () => {
		it('should upload file, return metadata and download correct content', async () => {
			const filePath = 'test/a/b/c.txt';
			const fileContent = Buffer.from('testContent');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'file.txt');

			const metadataResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/metadata`);

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(metadataResponse.statusCode).toStrictEqual(200);
			expect(metadataResponse.body).toStrictEqual({
				fullPath: filePath,
				path: path.dirname(filePath),
				name: path.basename(filePath),
				mimeType: lookup(filePath),
				size: expect.any(Number),
				created: expect.any(String),
				updated: expect.any(String),
				uuid: expect.any(String),
			});

			expect(downloadResponse.statusCode).toStrictEqual(200);
			expect(downloadResponse.body).toStrictEqual(fileContent);
		});

		it('should upload file, fail trying to upload again with overwrite=false, return metadata and download correct content', async () => {
			const filePath = 'test/a/b/c.txt';
			const fileContent = Buffer.from('testContent');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'file.txt');

			const failedUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${filePath}`)
				.attach('file', fileContent, 'file.txt');

			const metadataResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/metadata`);

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(metadataResponse.statusCode).toStrictEqual(200);
			expect(metadataResponse.body).toStrictEqual({
				fullPath: filePath,
				path: path.dirname(filePath),
				name: path.basename(filePath),
				mimeType: lookup(filePath),
				size: expect.any(Number),
				created: expect.any(String),
				updated: expect.any(String),
				uuid: expect.any(String),
			});

			expect(downloadResponse.statusCode).toStrictEqual(200);
			expect(downloadResponse.body).toStrictEqual(fileContent);
		});
	});
});
