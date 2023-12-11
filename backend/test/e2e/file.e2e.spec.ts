import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';

import { File } from 'src/api/file/entities/file.entity';
import { configureApplication } from 'src/app.config';
import { AppModuleConfig } from 'src/app.module';
import { Environment } from 'src/env.config';
import { FileUtils } from 'src/util/FileUtils';

import * as request from 'supertest';

describe('/file/', () => {
	let app: INestApplication;
	let dataSource: DataSource;
	let configService: ConfigService;
	let runner: QueryRunner;

	const apiPath = '/file/';

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

	describe('POST /file/:path', () => {
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

		it('should fail uploading a file if path leaves dir', async () => {
			const filePath = '../../../../../test.txt';

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`);

			expect(uploadResponse.statusCode).toStrictEqual(400);
		});

		it('should upload file and set correct mimeType depending on filePath and not on attached file name', async () => {
			const filePath = 'f/c/test.txt';
			const fileContent = Buffer.from('firstContent');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'file.csv');

			const metadataResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/metadata`);

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(metadataResponse.body.mimeType).toStrictEqual('text/plain');
		});
	});

	describe('POST /file/:path/restore', () => {
		it('should fail trying to restore file if already exists and overwrite=false and download correct content', async () => {
			const filePath = 'test/abcdef.txt';
			const fileContent = Buffer.from('fileContent');
			const secondFileContent = Buffer.from('otherContent');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'a.txt');

			const deleteResponse = await request(app.getHttpServer()).delete(`${apiPath}${filePath}`);

			const secondUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${filePath}`)
				.attach('file', secondFileContent, 'a.txt');

			const restoreResponse = await request(app.getHttpServer()).post(`${apiPath}${deleteResponse.body.uuid}/restore`);

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(deleteResponse.statusCode).toStrictEqual(200);
			expect(deleteResponse.body).toStrictEqual({ uuid: expect.any(String) });

			expect(secondUploadResponse.statusCode).toStrictEqual(201);
			expect(secondUploadResponse.body).toStrictEqual({ path: filePath });

			expect(restoreResponse.statusCode).toStrictEqual(409);

			expect(downloadResponse.statusCode).toStrictEqual(200);
			expect(downloadResponse.body).toStrictEqual(secondFileContent);
		});

		it('should restore file and download original content', async () => {
			const filePath = 'a/b/c/d.txt';
			const fileContent = Buffer.from('testContent');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'a.txt');

			const deleteResponse = await request(app.getHttpServer()).delete(`${apiPath}${filePath}`);

			const restoreResponse = await request(app.getHttpServer()).post(`${apiPath}${deleteResponse.body.uuid}/restore`);

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(deleteResponse.statusCode).toStrictEqual(200);
			expect(deleteResponse.body).toStrictEqual({ uuid: expect.any(String) });

			expect(restoreResponse.statusCode).toStrictEqual(201);
			expect(restoreResponse.body).toStrictEqual({ path: filePath });

			expect(downloadResponse.statusCode).toStrictEqual(200);
			expect(downloadResponse.body).toStrictEqual(fileContent);
		});

		it('should restore file, overwrite existing and download correct content with overwrite=false', async () => {
			const filePath = 'test/x/y/z.txt';
			const fileContent = Buffer.from('fileContent');
			const secondFileContent = Buffer.from('secondFileContent');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'file.txt');

			const deleteResponse = await request(app.getHttpServer()).delete(`${apiPath}${filePath}`);

			const secondUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${filePath}`)
				.attach('file', secondFileContent, 'file.txt');

			const restoreResponse = await request(app.getHttpServer()).post(`${apiPath}${deleteResponse.body.uuid}/restore?overwrite=true`);

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(deleteResponse.statusCode).toStrictEqual(200);
			expect(deleteResponse.body).toStrictEqual({ uuid: expect.any(String) });

			expect(secondUploadResponse.statusCode).toStrictEqual(201);
			expect(secondUploadResponse.body).toStrictEqual({ path: filePath });

			expect(restoreResponse.statusCode).toStrictEqual(201);
			expect(restoreResponse.body).toStrictEqual({ path: filePath });

			expect(downloadResponse.statusCode).toStrictEqual(200);
			expect(downloadResponse.body).toStrictEqual(fileContent);
		});
	});

	describe('GET /file/:path/download', () => {
		it('should download file with correct content and correct headers', async () => {
			const filePath = 'test/a/b/c.csv';
			const fileContent = Buffer.from('testContent');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'abc.csv');

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(downloadResponse.statusCode).toStrictEqual(200);
			expect(downloadResponse.body).toStrictEqual(fileContent);
			expect(downloadResponse.headers['content-disposition']).toStrictEqual('attachment; filename=c.csv');
			expect(downloadResponse.headers['content-type']).toStrictEqual('text/csv; charset=utf-8');
		});

		it('should download correct file with correct content and correct headers when multiple files with same name but different extensions exist', async () => {
			const firstFilePath = 'test/a/b/c.csv';
			const firstFileContent = Buffer.from('firstTestContent');

			const secondFilePath = 'test/a/b/c.txt';
			const secondFileContent = Buffer.from('secondTestContent');

			const firstUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${firstFilePath}`)
				.attach('file', firstFileContent, 'abc.csv');

			const secondUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${secondFilePath}`)
				.attach('file', secondFileContent, 'abc.csv');

			const firstDownloadResponse = await request(app.getHttpServer())
				.get(`${apiPath}${firstFilePath}/download`)
				.responseType('blob');

			const secondDownloadResponse = await request(app.getHttpServer())
				.get(`${apiPath}${secondFilePath}/download`)
				.responseType('blob');

			expect(firstUploadResponse.statusCode).toStrictEqual(201);
			expect(firstUploadResponse.body).toStrictEqual({ path: firstFilePath });

			expect(secondUploadResponse.statusCode).toStrictEqual(201);
			expect(secondUploadResponse.body).toStrictEqual({ path: secondFilePath });

			expect(firstDownloadResponse.statusCode).toStrictEqual(200);
			expect(firstDownloadResponse.body).toStrictEqual(firstFileContent);
			expect(firstDownloadResponse.headers['content-disposition']).toStrictEqual('attachment; filename=c.csv');
			expect(firstDownloadResponse.headers['content-type']).toStrictEqual('text/csv; charset=utf-8');

			expect(secondDownloadResponse.statusCode).toStrictEqual(200);
			expect(secondDownloadResponse.body).toStrictEqual(secondFileContent);
			expect(secondDownloadResponse.headers['content-disposition']).toStrictEqual('attachment; filename=c.txt');
			expect(secondDownloadResponse.headers['content-type']).toStrictEqual('text/plain; charset=utf-8');
		});
	});

	describe('GET /file/:path/metadata', () => {
		it('should return correct metadata after creation', async () => {
			const filePath = 'y/7y/fw.txt';
			const fileContent = Buffer.from('fileContent');

			const date = Date.now();
			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'a.txt');

			const metadataResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/metadata`);

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(metadataResponse.statusCode).toStrictEqual(200);
			expect(metadataResponse.body.fullPath).toStrictEqual(filePath);
			expect(metadataResponse.body.name).toStrictEqual('fw.txt');
			expect(metadataResponse.body.path).toStrictEqual('y/7y');
			expect(metadataResponse.body.mimeType).toStrictEqual('text/plain');
			expect(+metadataResponse.body.size).toStrictEqual(11);
			expect(Date.parse(metadataResponse.body.created)).toBeGreaterThanOrEqual(date);
			expect(Date.parse(metadataResponse.body.created)).toBeLessThanOrEqual(date + 5000);
			expect(metadataResponse.body.updated).toStrictEqual(metadataResponse.body.created);
			expect(metadataResponse.body.uuid).toStrictEqual(expect.any(String));
		});

		it("'updated' should change but 'created' should not on replacing", async () => {});
	});

	describe('PATCH /file/:path', () => {
		it('should successfully rename file and fail to download original file', async () => {
			const filePath = 'a/b/c.txt';
			const fileContent = Buffer.from('fileContent');
			const renamedPath = 'a/xyz.csv';

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'a.txt');

			const renameResponse = await request(app.getHttpServer()).patch(`${apiPath}${filePath}`).send({ newPath: renamedPath });

			const firstDownloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			const secondDownloadResponse = await request(app.getHttpServer()).get(`${apiPath}${renamedPath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(renameResponse.statusCode).toStrictEqual(200);
			expect(renameResponse.body).toStrictEqual({ path: renamedPath });

			expect(firstDownloadResponse.statusCode).toStrictEqual(404);

			expect(secondDownloadResponse.statusCode).toStrictEqual(200);
			expect(secondDownloadResponse.body).toStrictEqual(fileContent);
		});

		it('should successfully replace existing file on renaming  and download content of replaced file', async () => {
			const firstFilePath = 'a/b/c.txt';
			const firstFileContent = Buffer.from('firstContent');
			const secondFilePath = 'a/r.csv';
			const secondFileContent = Buffer.from('firstContent');

			const firstUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${firstFilePath}`)
				.attach('file', firstFileContent, 'a.txt');

			const secondUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${secondFilePath}`)
				.attach('file', secondFileContent, 'a.txt');

			const renameResponse = await request(app.getHttpServer())
				.patch(`${apiPath}${firstFilePath}?overwrite=true`)
				.send({ newPath: secondFilePath });

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${secondFilePath}/download`).responseType('blob');

			expect(firstUploadResponse.statusCode).toStrictEqual(201);
			expect(firstUploadResponse.body).toStrictEqual({ path: firstFilePath });

			expect(secondUploadResponse.statusCode).toStrictEqual(201);
			expect(secondUploadResponse.body).toStrictEqual({ path: secondFilePath });

			expect(renameResponse.statusCode).toStrictEqual(200);
			expect(renameResponse.body).toStrictEqual({ path: secondFilePath });

			expect(downloadResponse.statusCode).toStrictEqual(200);
			expect(downloadResponse.body).toStrictEqual(secondFileContent);
		});
	});

	describe('DELETE /file/:path', () => {
		it('should delete file and fail trying to download', async () => {
			const filePath = 'x/y/z.txt';
			const fileContent = Buffer.from('fjkelrg');

			const uploadResponse = await request(app.getHttpServer()).post(`${apiPath}${filePath}`).attach('file', fileContent, 'test.txt');

			const deleteResponse = await request(app.getHttpServer()).delete(`${apiPath}${filePath}`);

			const downloadResponse = await request(app.getHttpServer()).get(`${apiPath}${filePath}/download`).responseType('blob');

			expect(uploadResponse.statusCode).toStrictEqual(201);
			expect(uploadResponse.body).toStrictEqual({ path: filePath });

			expect(deleteResponse.statusCode).toStrictEqual(200);
			expect(deleteResponse.body).toStrictEqual({ uuid: expect.any(String) });

			expect(downloadResponse.statusCode).toStrictEqual(404);
		});

		it('should delete file and fail trying to download that file but succeed trying to download same file with different extension', async () => {
			const firstFilePath = 'a/b/c.txt';
			const firstFileContent = Buffer.from('firstContent');

			const secondFilePath = 'a/b/c.csv';
			const secondFileContent = Buffer.from('secondContent');

			const firstUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${firstFilePath}`)
				.attach('file', firstFileContent, 'test.txt');

			const secondUploadResponse = await request(app.getHttpServer())
				.post(`${apiPath}${secondFilePath}`)
				.attach('file', secondFileContent, 'test.csv');

			const deleteResponse = await request(app.getHttpServer()).delete(`${apiPath}${firstFilePath}`);

			const firstDownloadResponse = await request(app.getHttpServer())
				.get(`${apiPath}${firstFilePath}/download`)
				.responseType('blob');

			const secondDownloadResponse = await request(app.getHttpServer())
				.get(`${apiPath}${secondFilePath}/download`)
				.responseType('blob');

			expect(firstUploadResponse.statusCode).toStrictEqual(201);
			expect(firstUploadResponse.body).toStrictEqual({ path: firstFilePath });

			expect(secondUploadResponse.statusCode).toStrictEqual(201);
			expect(secondUploadResponse.body).toStrictEqual({ path: secondFilePath });

			expect(deleteResponse.statusCode).toStrictEqual(200);
			expect(deleteResponse.body).toStrictEqual({ uuid: expect.any(String) });

			expect(firstDownloadResponse.statusCode).toStrictEqual(404);

			expect(secondDownloadResponse.statusCode).toStrictEqual(200);
			expect(secondDownloadResponse.body).toStrictEqual(secondFileContent);
		});
	});
});
