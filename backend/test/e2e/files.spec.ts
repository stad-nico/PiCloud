import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';

import { File } from 'src/api/files/entities/file.entity';
import { configureApplication } from 'src/app.config';
import { AppModuleConfig } from 'src/app.module';
import { Environment } from 'src/env.config';
import { FileUtils } from 'src/util/FileUtils';

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

	it('should upload file, rename successfully to file with different mimeType, download correct content and fail when trying to download at old path', async () => {
		const filePath = 'test/a/b/c.txt';
		const newPath = 'test.csv';
		const fileContent = Buffer.from('firstTestContent');

		const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'filename.txt');

		expect(uploadResponse.statusCode).toStrictEqual(201);
		expect(uploadResponse.body).toStrictEqual({ path: filePath });

		const renameResponse = await request(app.getHttpServer()).patch(`${apiPath}${filePath}`).send({ newPath: newPath });

		expect(renameResponse.statusCode).toStrictEqual(200);
		expect(renameResponse.body).toStrictEqual({ path: newPath });

		const failedDownloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

		expect(failedDownloadResponse.statusCode).toStrictEqual(404);

		const successfulDownloadResponse = await request(app.getHttpServer()).get(`${apiPath}${newPath}/download`).responseType('blob');

		expect(successfulDownloadResponse.statusCode).toStrictEqual(200);
		expect(successfulDownloadResponse.body).toStrictEqual(fileContent);
	});

	it('should upload file, rename successfully to file with same mimeType, download correct content and fail when trying to download at old path', async () => {
		const filePath = 'test/a/b/c.txt';
		const newPath = 'test.txt';
		const fileContent = Buffer.from('firstTestContent');

		const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'filename.txt');

		expect(uploadResponse.statusCode).toStrictEqual(201);
		expect(uploadResponse.body).toStrictEqual({ path: filePath });

		const renameResponse = await request(app.getHttpServer()).patch(`${apiPath}${filePath}`).send({ newPath: newPath });

		expect(renameResponse.statusCode).toStrictEqual(200);
		expect(renameResponse.body).toStrictEqual({ path: newPath });

		const failedDownloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

		expect(failedDownloadResponse.statusCode).toStrictEqual(404);

		const successfulDownloadResponse = await request(app.getHttpServer()).get(`${apiPath}${newPath}/download`).responseType('blob');

		expect(successfulDownloadResponse.statusCode).toStrictEqual(200);
		expect(successfulDownloadResponse.body).toStrictEqual(fileContent);
	});

	it('should upload file, replace if trying to upload again at same path with overwrite=true and download correct content', async () => {
		const filePath = 'test/a/b/c.txt';
		const firstFileContent = Buffer.from('firstTestContent');
		const secondFileContent = Buffer.from('secondTestContent');

		const uploadResponse = await request(app.getHttpServer())
			.post(`${apiPath}${filePath}`)
			.attach('file', firstFileContent, 'filename.txt');

		expect(uploadResponse.statusCode).toStrictEqual(201);
		expect(uploadResponse.body).toStrictEqual({ path: filePath });

		const secondUploadResponse = await request(app.getHttpServer())
			.post(`${apiPath}${filePath}?overwrite=true`)
			.attach('file', secondFileContent, 'filename.txt');

		expect(secondUploadResponse.statusCode).toStrictEqual(201);
		expect(secondUploadResponse.body).toStrictEqual({ path: filePath });

		const downloadResponse = await request(app.getHttpServer())
			.get(`${apiPath}${filePath}/download?overwrite=false`)
			.responseType('blob');

		expect(downloadResponse.statusCode).toStrictEqual(200);
		expect(downloadResponse.body).toStrictEqual(secondFileContent);
	});

	it('should upload file, fail if trying to upload again at same path and download correct content', async () => {
		const filePath = 'test/a/b/c.txt';
		const firstFileContent = Buffer.from('firstTestContent');
		const secondFileContent = Buffer.from('secondTestContent');

		const uploadResponse = await request(app.getHttpServer())
			.post(`${apiPath}${filePath}`)
			.attach('file', firstFileContent, 'filename.txt');

		expect(uploadResponse.statusCode).toStrictEqual(201);
		expect(uploadResponse.body).toStrictEqual({ path: filePath });

		const secondUploadResponse = await request(app.getHttpServer())
			.post(`${apiPath}${filePath}?overwrite=false`)
			.attach('file', secondFileContent, 'filename.txt');

		expect(secondUploadResponse.statusCode).toStrictEqual(409);

		const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

		expect(downloadResponse.statusCode).toStrictEqual(200);
		expect(downloadResponse.body).toStrictEqual(firstFileContent);
	});

	it('should upload file, return metadata and download with correct content', async () => {
		const filePath = 'test/a/b/c.txt';
		const fileContent = Buffer.from('testContent');

		const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'filename.txt');

		expect(uploadResponse.statusCode).toStrictEqual(201);
		expect(uploadResponse.body).toStrictEqual({ path: filePath });

		const metadataResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/metadata`);

		expect(metadataResponse.statusCode).toStrictEqual(200);
		expect(metadataResponse.body).not.toStrictEqual({});

		const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

		expect(downloadResponse.statusCode).toStrictEqual(200);
		expect(downloadResponse.body).toStrictEqual(fileContent);
	});
});
