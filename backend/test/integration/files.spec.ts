import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs/promises';
import { File } from 'src/api/files/entities/file.entity';
import { FilesModule } from 'src/api/files/files.module';
import { configureApplication } from 'src/app.config';
import { FileUtils } from 'src/util/FileUtils';
import * as request from 'supertest';
import { mockedQueryRunner } from 'test/mock/mockedQueryRunner.spec';
import { DataSource, QueryRunner } from 'typeorm';

describe('/files/', () => {
	let app: INestApplication;
	let dataSource: DataSource;
	let module: TestingModule;

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [
				FilesModule,
				TypeOrmModule.forRoot({
					type: 'mysql',
					host: 'localhost',
					port: 3306,
					username: 'root',
					password: 'mysqldev',
					database: 'cloud-test',
					autoLoadEntities: true,
					synchronize: true,
				}),
			],
		}).compile();

		app = module.createNestApplication();
		configureApplication(app);

		dataSource = module.get<DataSource>(DataSource);

		await app.init();
	});

	afterEach(async () => {
		await dataSource.createQueryBuilder().delete().from(File).execute();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('/files/:path (POST)', () => {
		// prevent any modifications to the fs in tests
		jest.spyOn(fs, 'mkdir').mockImplementation();
		jest.spyOn(fs, 'writeFile').mockImplementation();

		it('200 - file uploaded successfully', async () => {
			return request(app.getHttpServer())
				.post('/files/test/test.txt')
				.attach('file', Buffer.from('f'), 'file.txt')
				.expect(201)
				.expect({
					path: 'test/test.txt',
				})
				.then(async () => {
					let file: File | null = await dataSource
						.createQueryRunner()
						.manager.findOne(File, { where: { fullPath: 'test/test.txt' } });

					expect(file).toMatchObject({
						fullPath: 'test/test.txt',
						mimeType: 'text/plain',
						name: 'test.txt',
						path: 'test',
						size: '1',
					});
					expect(file).toHaveProperty('created');
					expect(file).toHaveProperty('updated');
					expect(await FileUtils.pathExists('test/test.txt')).resolves.toBeTruthy();
				})
				.catch((err) => {
					throw err;
				});
		});

		it('400 - file must not be empty', () => {
			return request(app.getHttpServer()).post('/files/test.txt').expect(400).expect({
				message: 'file must not be empty',
				error: 'Bad Request',
				statusCode: 400,
			});
		});

		describe('409 - file already exists', () => {
			it('should return 409 if file already exists in db', () => {
				jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as unknown as QueryRunner);
				jest.spyOn(mockedQueryRunner.manager, 'exists').mockResolvedValueOnce(true);

				return request(app.getHttpServer()).post('/files/test.txt').attach('file', __filename).expect({
					message: 'file at test.txt already exists',
					error: 'Conflict',
					statusCode: 409,
				});
			});

			it('should return 409 if file already exists in fs', () => {
				jest.spyOn(fs, 'access').mockResolvedValueOnce(undefined);

				return request(app.getHttpServer()).post('/files/test.txt').attach('file', __filename).expect({
					message: 'file at test.txt already exists',
					error: 'Conflict',
					statusCode: 409,
				});
			});
		});

		it('500 - something went wrong', () => {
			jest.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error());

			return request(app.getHttpServer()).post('/files/test/test.txt').attach('file', __filename).expect(500).expect({
				message: 'something went wrong',
				error: 'Internal Server Error',
				statusCode: 500,
			});
		});
	});
});
