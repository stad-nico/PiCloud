import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AppModuleConfig } from 'src/api/app.module';
import { mockedQueryRunner } from 'test/mock/mockedQueryRunner.spec';
import { DataSource, QueryRunner } from 'typeorm';

import * as fs from 'fs/promises';
import { File } from 'src/api/files/entities/file.entity';
import { FileUtils } from 'src/util/FileUtils';
import * as request from 'supertest';

describe('/files/', () => {
	let app: INestApplication;
	let dataSource: DataSource;
	let configService: ConfigService;

	beforeAll(async () => {
		const testingModule = await Test.createTestingModule(AppModuleConfig).compile();

		app = testingModule.createNestApplication();
		dataSource = testingModule.get<DataSource>(DataSource);
		configService = testingModule.get<ConfigService>(ConfigService);

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
		it('200 - file uploaded successfully', async () => {
			const filename = 'test.txt';
			const dirPath = 'files/test';
			const fullPath = dirPath + '/' + filename;

			return request(app.getHttpServer())
				.post('/files/' + fullPath)
				.attach('file', Buffer.from('f'), 'file.txt')
				.expect(201)
				.expect({
					path: fullPath,
				})
				.then(async () => {
					let file: File | null = await dataSource.createQueryRunner().manager.findOne(File, { where: { fullPath: fullPath } });
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
				})
				.catch((err) => {
					throw err;
				});
		});

		it('400 - file must not be empty', () => {
			return request(app.getHttpServer()).post('/files/files/test.txt').expect(400).expect({
				message: 'file must not be empty',
				error: 'Bad Request',
				statusCode: 400,
			});
		});

		describe('409 - file already exists', () => {
			it('should return 409 if file already exists in db', () => {
				jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as unknown as QueryRunner);
				jest.spyOn(mockedQueryRunner.manager, 'exists').mockResolvedValueOnce(true);

				return request(app.getHttpServer()).post('/files/files/test.txt').attach('file', __filename).expect({
					message: 'file at files/test.txt already exists',
					error: 'Conflict',
					statusCode: 409,
				});
			});

			it('should return 409 if file already exists in fs', () => {
				jest.spyOn(fs, 'access').mockResolvedValueOnce(undefined);

				return request(app.getHttpServer()).post('/files/files/test.txt').attach('file', __filename).expect({
					message: 'file at files/test.txt already exists',
					error: 'Conflict',
					statusCode: 409,
				});
			});
		});

		it('500 - something went wrong', () => {
			jest.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error());

			return request(app.getHttpServer()).post('/files/files/test/test2.txt').attach('file', __filename).expect(500).expect({
				message: 'something went wrong',
				error: 'Internal Server Error',
				statusCode: 500,
			});
		});
	});
});
