import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';

import { File } from 'src/api/files/entities/file.entity';
import { FileMetadataResponse } from 'src/api/files/responses';
import { configureApplication } from 'src/app.config';
import { AppModuleConfig } from 'src/app.module';
import { FileUtils } from 'src/util/FileUtils';
import { mockedQueryRunner } from 'test/mock/mockedQueryRunner.spec';

import * as fsPromises from 'fs/promises';
import * as request from 'supertest';

describe('/files/', () => {
	let app: INestApplication;
	let dataSource: DataSource;
	let configService: ConfigService;

	beforeAll(async () => {
		const testingModule = await Test.createTestingModule(AppModuleConfig).compile();

		app = testingModule.createNestApplication();
		configureApplication(app);

		dataSource = testingModule.get(DataSource);
		configService = testingModule.get(ConfigService);

		await app.init();
	});

	afterEach(async () => {
		await dataSource.createQueryBuilder().delete().from(File).execute();
	});

	afterAll(async () => {
		await dataSource.destroy();
		await app.close();
	});

	describe('/files/:path (POST)', () => {
		it('201 - file uploaded successfully', async () => {
			const filename = 'test.txt';
			const dirPath = 'files/test';
			const fullPath = dirPath + '/' + filename;

			const response = await request(app.getHttpServer())
				.post('/files/' + fullPath)
				.attach('file', Buffer.from('f'), 'file.txt');

			expect(response.statusCode).toStrictEqual(201);
			expect(response.body).toStrictEqual({ path: fullPath });

			const file: File | null = await dataSource.createQueryRunner().manager.findOne(File, { where: { fullPath: fullPath } });

			expect(file).toMatchObject({
				fullPath: fullPath,
				mimeType: 'text/plain',
				name: filename,
				path: dirPath,
				size: '1',
			});
			expect(file).toHaveProperty('created');
			expect(file).toHaveProperty('updated');
			expect(FileUtils.pathExists(FileUtils.join(configService, fullPath))).resolves.toBeTruthy();
		});

		it('400 - file must not be empty', async () => {
			const response = await request(app.getHttpServer()).post('/files/files/test.txt');

			expect(response.statusCode).toStrictEqual(400);
			expect(response.body).toStrictEqual({
				message: 'file must not be empty',
				error: 'Bad Request',
				statusCode: 400,
			});
		});

		describe('400 - path must be a valid file path', () => {
			it('should return 400 if path is not relative', async () => {
				jest.spyOn(FileUtils, 'isPathRelative').mockReturnValueOnce(false);

				const response = await request(app.getHttpServer()).post('/files/test.txt').attach('file', __filename);

				expect(response.statusCode).toStrictEqual(400);
				expect(response.body).toStrictEqual({
					message: 'path must be a valid file path',
					error: 'Bad Request',
					statusCode: 400,
				});
			});

			it('should return 400 if path is not passing validation pipe', async () => {
				const response = await request(app.getHttpServer()).post('/files/../../.t.txt').attach('file', __filename);
				expect(response.statusCode).toStrictEqual(400);
				expect(response.body).toStrictEqual({
					message: 'path must be a valid file path',
					error: 'Bad Request',
					statusCode: 400,
				});
			});
		});

		describe('409 - file already exists', () => {
			it('should return 409 if file already exists in db', async () => {
				jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as unknown as QueryRunner);
				jest.spyOn(mockedQueryRunner.manager, 'exists').mockResolvedValueOnce(true);

				const response = await request(app.getHttpServer()).post('/files/files/test.txt').attach('file', __filename);

				expect(response.statusCode).toStrictEqual(409);
				expect(response.body).toStrictEqual({
					message: 'file at files/test.txt already exists',
					error: 'Conflict',
					statusCode: 409,
				});
			});

			it('should return 409 if file already exists in fs', async () => {
				jest.spyOn(fsPromises, 'access').mockResolvedValueOnce(undefined);

				const response = await request(app.getHttpServer()).post('/files/files/test.txt').attach('file', __filename);

				expect(response.statusCode).toStrictEqual(409);
				expect(response.body).toStrictEqual({
					message: 'file at files/test.txt already exists',
					error: 'Conflict',
					statusCode: 409,
				});
			});
		});

		it('500 - something went wrong', async () => {
			jest.spyOn(fsPromises, 'writeFile').mockRejectedValueOnce(new Error());

			const response = await request(app.getHttpServer()).post('/files/files/test/test2.txt').attach('file', __filename);

			expect(response.statusCode).toStrictEqual(500);
			expect(response.body).toStrictEqual({
				message: 'something went wrong',
				error: 'Internal Server Error',
				statusCode: 500,
			});
		});
	});

	describe('/files/:path/metadata (GET)', () => {
		it('200 - get metadata', async () => {
			const date = new Date();
			const metadata = new FileMetadataResponse('', '', '', '', 0, date, date) as {};
			jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as any);
			jest.spyOn(mockedQueryRunner.manager, 'findOne').mockResolvedValueOnce(metadata);

			const response = await request(app.getHttpServer()).get('/files/test/t.txt/metadata');

			expect(response.statusCode).toStrictEqual(200);
			expect(response.body).toStrictEqual({ ...metadata, created: date.toISOString(), updated: date.toISOString() });
		});

		it('400 - path must be a valid file path', async () => {
			const response = await request(app.getHttpServer()).get('/files/../../.t.txt/metadata');

			expect(response.statusCode).toStrictEqual(400);
			expect(response.body).toStrictEqual({
				message: 'path must be a valid file path',
				error: 'Bad Request',
				statusCode: 400,
			});
		});

		it('404 - file not found', async () => {
			jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as unknown as QueryRunner);
			jest.spyOn(mockedQueryRunner.manager, 'findOne').mockResolvedValueOnce(null);

			const response = await request(app.getHttpServer()).get('/files/test.txt/metadata');

			expect(response.statusCode).toStrictEqual(404);
			expect(response.body).toStrictEqual({
				message: 'file at test.txt does not exist',
				error: 'Not Found',
				statusCode: 404,
			});
		});

		it('500 - something went wrong', async () => {
			jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as unknown as QueryRunner);
			jest.spyOn(mockedQueryRunner.manager, 'findOne').mockRejectedValueOnce(undefined);

			const response = await request(app.getHttpServer()).get('/files/test.txt/metadata');

			expect(response.statusCode).toStrictEqual(500);
			expect(response.body).toStrictEqual({
				message: 'something went wrong',
				error: 'Internal Server Error',
				statusCode: 500,
			});
		});
	});

	describe('/files/:path/download (GET)', () => {
		it('200 - download success', async () => {
			jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as any);
			jest.spyOn(mockedQueryRunner.manager, 'findOne').mockResolvedValueOnce({
				fullPath: 't.txt',
				name: 't.txt',
				mimeType: 'text/plain',
			});
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValueOnce(true);

			await fsPromises.writeFile(FileUtils.join(configService, 't.txt'), Buffer.from('test content'));

			const response = await request(app.getHttpServer()).get('/files/test.txt/download').responseType('blob');

			expect(response.statusCode).toStrictEqual(200);
			expect(response.headers['content-disposition']).toStrictEqual('attachment; filename=t.txt');
			expect(response.headers['content-type']).toStrictEqual('text/plain; charset=utf-8');
			expect(response.body).toStrictEqual(Buffer.from('test content'));
		});

		it('400 - path must be a valid file path', async () => {
			const response = await request(app.getHttpServer()).get('/files/../../t.txt/../f.txt/download');

			expect(response.statusCode).toStrictEqual(400);
			expect(response.body).toStrictEqual({
				message: 'path must be a valid file path',
				statusCode: 400,
				error: 'Bad Request',
			});
		});

		describe('404 - file not found', () => {
			it('should return 404 if file does not exist in db layer', async () => {
				const response = await request(app.getHttpServer()).get('/files/test.txt/download');

				expect(response.statusCode).toStrictEqual(404);
				expect(response.body).toStrictEqual({
					message: 'file at test.txt does not exist',
					statusCode: 404,
					error: 'Not Found',
				});
			});

			it('should return 404 if file does not exist in fs layer', async () => {
				jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as any);
				jest.spyOn(mockedQueryRunner.manager, 'findOne').mockResolvedValueOnce({
					fullPath: 'test.txt',
					mimeType: 'text/plain',
				});

				const response = await request(app.getHttpServer()).get('/files/test.txt/download');

				expect(response.statusCode).toStrictEqual(404);
				expect(response.body).toStrictEqual({
					message: 'file at test.txt does not exist',
					statusCode: 404,
					error: 'Not Found',
				});
			});
		});

		describe('500 - something went wrong', () => {
			it('should return 500 if createReadStream fails', async () => {
				jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as any);
				jest.spyOn(mockedQueryRunner.manager, 'findOne').mockResolvedValueOnce({
					fullPath: 'test.txt',
					mimeType: 'text/plain',
				});
				jest.spyOn(FileUtils, 'pathExists').mockResolvedValueOnce(true);

				const response = await request(app.getHttpServer()).get('/files/test.txt/download');

				expect(response.statusCode).toStrictEqual(500);
				expect(response.body).toStrictEqual({
					error: 'Internal Server Error',
					message: 'something went wrong',
					statusCode: 500,
				});
			});

			it('should return 500 if error occurs', async () => {
				jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as any);
				jest.spyOn(mockedQueryRunner.manager, 'findOne').mockRejectedValueOnce('error');

				const response = await request(app.getHttpServer()).get('/files/test.txt/download');

				expect(response.statusCode).toStrictEqual(500);
				expect(response.body).toStrictEqual({
					error: 'Internal Server Error',
					message: 'something went wrong',
					statusCode: 500,
				});
			});
		});
	});

	describe('files/:path (DELETE)', () => {
		it('204 - delete success', () => {});

		it('400 - path must be a valid file path', async () => {});

		it('404 - file not found', async () => {});

		it('500 - something went wrong', () => {});
	});
});
