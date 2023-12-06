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

	describe('POST /files/:path', () => {
		it('should upload file and download correct content', async () => {
			const filePath = 'test/a/b/c.txt';
			const fileContent = Buffer.from('testContent');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'file.txt');

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(downloadResponse.statusCode).toStrictEqual(200);
			expect(downloadResponse.body).toStrictEqual(fileContent);
		});

		it('should upload file, fail trying to upload same file again with overwrite=false and download correct content', async () => {
			const filePath = 'test/a/b/c.txt';
			const fileContent = Buffer.from('testContent');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'file.txt');

			const failedUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${filePath}`)
				.attach('file', fileContent, 'file.txt');

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(failedUploadResponse.statusCode).toStrictEqual(409);

			expect(downloadResponse.statusCode).toStrictEqual(200);
			expect(downloadResponse.body).toStrictEqual(fileContent);
		});

		it('should upload file, succeed trying to upload same name with different file extensions and download correct content', async () => {
			const firstFilePath = 'a/b/file.txt';
			const firstFileContent = Buffer.from('firstContent');

			const secondFilePath = 'a/b/file.csv';
			const secondFileContent = Buffer.from('secondContent');

			const thirdFilePath = 'a/b/file.md';
			const thirdFileContent = Buffer.from('thirdContent');

			const firstUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${firstFilePath}`)
				.attach('file', firstFileContent, 'file.txt');

			const secondUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${secondFilePath}`)
				.attach('file', secondFileContent, 'file.csv');

			const thirdUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${thirdFilePath}`)
				.attach('file', thirdFileContent, 'file.md');

			const firstDownloadResponse = await request(app.getHttpServer())
				.get(`${apiPath}${firstFilePath}/download`)
				.responseType('blob');

			const secondDownloadResponse = await request(app.getHttpServer())
				.get(`${apiPath}${secondFilePath}/download`)
				.responseType('blob');

			const thirdDownloadResponse = await request(app.getHttpServer())
				.get(`${apiPath}${thirdFilePath}/download`)
				.responseType('blob');

			expect(firstUploadResponse.statusCode).toStrictEqual(201);
			expect(firstUploadResponse.body).toStrictEqual({ path: firstFilePath });

			expect(secondUploadResponse.statusCode).toStrictEqual(201);
			expect(secondUploadResponse.body).toStrictEqual({ path: secondFilePath });

			expect(thirdUploadResponse.statusCode).toStrictEqual(201);
			expect(thirdUploadResponse.body).toStrictEqual({ path: thirdFilePath });

			expect(firstDownloadResponse.statusCode).toStrictEqual(200);
			expect(firstDownloadResponse.body).toStrictEqual(firstFileContent);

			expect(secondDownloadResponse.statusCode).toStrictEqual(200);
			expect(secondDownloadResponse.body).toStrictEqual(secondFileContent);

			expect(thirdDownloadResponse.statusCode).toStrictEqual(200);
			expect(thirdDownloadResponse.body).toStrictEqual(thirdFileContent);
		});

		it('should upload file, succeed uploading same file again with overwrite=true and download correct content', async () => {
			const filePath = 'f/c/test.txt';
			const fileContent = Buffer.from('firstContent');
			const replacedFileContent = Buffer.from('replacedContent');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'file.txt');

			const replacedUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${filePath}?overwrite=true`)
				.attach('file', replacedFileContent, 'file.txt');

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(replacedUploadResponse.statusCode).toStrictEqual(201);
			expect(replacedUploadResponse.body).toStrictEqual({ path: filePath });

			expect(downloadResponse.statusCode).toStrictEqual(200);
			expect(downloadResponse.body).toStrictEqual(replacedFileContent);
		});

		it('should fail uploading a file if no file attached', async () => {
			const filePath = 'x/y/z/test.txt';

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`);

			expect(uploadResponse.statusCode).toStrictEqual(400);
		});
	});
});
