import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';

import { AppModuleConfig } from 'src/AppModule';
import { File } from 'src/api/file/entities/file.entity';
import { configureApplication } from 'src/config/AppConfig';
import { Environment } from 'src/config/EnvConfig';
import { FileUtils } from 'src/util/FileUtils';

import * as fsPromises from 'fs/promises';
import { TestValidationPipe } from 'src/api/TestValidationPipe';
import * as request from 'supertest';
import { mockedQueryRunner } from 'test/mocks/mockedQueryRunner.spec';
import { v4 as generateUuid } from 'uuid';

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

	describe(`POST ${apiPath}:path`, () => {
		describe('201 - file uploaded successfully', () => {
			it("should return 201 if file does not already exist and query param 'overwrite' is false", async () => {
				const fileToExpect = {
					fullPath: 'test/test.txt',
					name: 'test.txt',
					path: 'test',
					mimeType: 'text/plain',
					isRecycled: false,
					uuid: expect.any(String),
					size: expect.any(Number),
					created: expect.any(Date),
					updated: expect.any(Date),
				};

				const response = await request(app.getHttpServer())
					.post(`${apiPath}${fileToExpect.fullPath}?overwrite=false`)
					.attach('file', Buffer.from('testContent'), 'filename.txt');

				const file = await runner.manager.findOne(File, { where: { fullPath: fileToExpect.fullPath, isRecycled: false } });
				const filePath = FileUtils.join(configService, file!.getUuidAsDirPath(), Environment.DiskStoragePath);
				const pathExists = await FileUtils.pathExists(filePath);
				const content = await fsPromises.readFile(filePath, { encoding: 'utf-8' });

				expect(response.statusCode).toStrictEqual(201);
				expect(response.body).toStrictEqual({ path: fileToExpect.fullPath });

				expect({ ...file }).toStrictEqual(fileToExpect);
				expect(pathExists).toBeTruthy();
				expect(content).toStrictEqual('testContent');
			});

			it("should return 201 if file does not already exist and query param 'overwrite' is true", async () => {
				const fileToExpect = {
					fullPath: 'test/test.txt',
					name: 'test.txt',
					path: 'test',
					mimeType: 'text/plain',
					isRecycled: false,
					uuid: expect.any(String),
					size: expect.any(Number),
					created: expect.any(Date),
					updated: expect.any(Date),
				};

				const response = await request(app.getHttpServer())
					.post(`${apiPath}${fileToExpect.fullPath}?overwrite=true`)
					.attach('file', Buffer.from('testContent'), 'filename.txt');

				const file = await runner.manager.findOne(File, { where: { fullPath: fileToExpect.fullPath, isRecycled: false } });
				const filePath = FileUtils.join(configService, file!.getUuidAsDirPath(), Environment.DiskStoragePath);

				const pathExists = await FileUtils.pathExists(filePath);
				const content = await fsPromises.readFile(filePath, { encoding: 'utf-8' });

				expect(response.statusCode).toStrictEqual(201);
				expect(response.body).toStrictEqual({ path: fileToExpect.fullPath });

				expect({ ...file }).toStrictEqual(fileToExpect);
				expect(pathExists).toBeTruthy();
				expect(content).toStrictEqual('testContent');
			});

			it("should return 201 if file does not already exist and query param 'overwrite' is not given", async () => {
				const fileToExpect = {
					fullPath: 'test/test.txt',
					name: 'test.txt',
					path: 'test',
					mimeType: 'text/plain',
					isRecycled: false,
					uuid: expect.any(String),
					size: expect.any(Number),
					created: expect.any(Date),
					updated: expect.any(Date),
				};

				const response = await request(app.getHttpServer())
					.post(`${apiPath}${fileToExpect.fullPath}`)
					.attach('file', Buffer.from('testContent'), 'filename.txt');

				const file = await runner.manager.findOne(File, { where: { fullPath: fileToExpect.fullPath, isRecycled: false } });
				const filePath = FileUtils.join(configService, file!.getUuidAsDirPath(), Environment.DiskStoragePath);

				const pathExists = await FileUtils.pathExists(filePath);
				const content = await fsPromises.readFile(filePath, { encoding: 'utf-8' });

				expect(response.statusCode).toStrictEqual(201);
				expect(response.body).toStrictEqual({ path: fileToExpect.fullPath });

				expect({ ...file }).toStrictEqual(fileToExpect);
				expect(pathExists).toBeTruthy();
				expect(content).toStrictEqual('testContent');
			});

			it("should return 201 if file does already exist and query param 'overwrite' is true", async () => {
				const existingFile = new File('test/f.txt', 'f.txt', 'test', 'text/plain', 10);
				const existingFilePath = FileUtils.join(configService, existingFile.getUuidAsDirPath(), Environment.DiskStoragePath);

				await runner.manager.save(File, existingFile);
				await FileUtils.writeFile(existingFilePath, Buffer.from('existingTestContent'));

				const response = await request(app.getHttpServer())
					.post(`${apiPath}${existingFile.fullPath}?overwrite=true`)
					.attach('file', Buffer.from('testContent'), 'filename.txt');

				const file = await runner.manager.findOne(File, { where: { fullPath: existingFile.fullPath, isRecycled: false } });
				const filePath = FileUtils.join(configService, file!.getUuidAsDirPath(), Environment.DiskStoragePath);

				const pathExists = await FileUtils.pathExists(filePath);
				const content = await fsPromises.readFile(filePath, { encoding: 'utf-8' });

				expect(response.statusCode).toStrictEqual(201);
				expect(response.body).toStrictEqual({ path: existingFile.fullPath });

				expect({ ...file }).toStrictEqual({
					...existingFile,
					uuid: file?.uuid,
					size: file?.size,
					created: file?.created,
					updated: file?.updated,
				});
				expect(pathExists).toBeTruthy();
				expect(content).toStrictEqual('testContent');
			});
		});

		it('400 - file must not be empty', async () => {
			const path = 'test.txt';
			const error = { message: 'file must not be empty', error: 'Bad Request', statusCode: 400 };

			const response = await request(app.getHttpServer()).post(`${apiPath}${path}`);

			const file = await runner.manager.findOne(File, { where: { fullPath: path, isRecycled: false } });
			const pathExists = await FileUtils.pathExists(FileUtils.join(configService, path, Environment.DiskStoragePath));

			expect(response.statusCode).toStrictEqual(400);
			expect(response.body).toStrictEqual(error);
			expect(file).toBeNull();
			expect(pathExists).toBeFalsy();
		});

		describe('400 - path must be a valid file path', () => {
			it('should return 400 if path is not relative', async () => {
				const path = '../../../test.txt';
				const error = { message: 'path must be a valid file path', error: 'Bad Request', statusCode: 400 };

				TestValidationPipe.disable();

				const response = await request(app.getHttpServer()).post(`${apiPath}${path}`).attach('file', __filename);

				const file = await runner.manager.findOne(File, { where: { fullPath: path, isRecycled: false } });
				const pathExists = await FileUtils.pathExists(FileUtils.join(configService, path, Environment.DiskStoragePath));

				TestValidationPipe.enable();

				expect(response.statusCode).toStrictEqual(400);
				expect(response.body).toStrictEqual(error);
				expect(file).toBeNull();
				expect(pathExists).toBeFalsy();
			});

			it('should return 400 if path is not passing validation pipe', async () => {
				const path = '../../.t.txt';
				const error = { message: 'path must be a valid file path', error: 'Bad Request', statusCode: 400 };

				const response = await request(app.getHttpServer()).post(`${apiPath}${path}`).attach('file', __filename);

				const file = await runner.manager.findOne(File, { where: { fullPath: path, isRecycled: false } });
				const pathExists = await FileUtils.pathExists(FileUtils.join(configService, path, Environment.DiskStoragePath));

				expect(response.statusCode).toStrictEqual(400);
				expect(response.body).toStrictEqual(error);
				expect(file).toBeNull();
				expect(pathExists).toBeFalsy();
			});
		});

		describe('409 - file already exists', () => {
			it("should return 409 if file already exists and query param 'overwrite' is false", async () => {
				const existingFile = new File('test/test.txt', 'test.txt', 'test', 'text/plain', 11);
				const error = { message: `file at ${existingFile.fullPath} already exists`, error: 'Conflict', statusCode: 409 };

				await runner.manager.save(File, existingFile);

				const response = await request(app.getHttpServer())
					.post(`${apiPath}${existingFile.fullPath}?overwrite=false`)
					.attach('file', __filename);

				const existingFoundFile = await runner.manager.findOne(File, { where: { fullPath: existingFile.fullPath } });
				const pathExists = await FileUtils.pathExists(
					FileUtils.join(configService, existingFile.fullPath, Environment.DiskStoragePath)
				);

				expect(response.statusCode).toStrictEqual(409);
				expect(response.body).toStrictEqual(error);
				expect(existingFoundFile).toStrictEqual(existingFile);
				expect(pathExists).toBeFalsy();
			});

			it("should return 409 if file already exists and query param 'overwrite' is not given", async () => {
				const existingFile = new File('test/test.txt', 'test.txt', 'test', 'text/plain', 11);
				const error = { message: `file at ${existingFile.fullPath} already exists`, error: 'Conflict', statusCode: 409 };

				await runner.manager.save(File, existingFile);

				const response = await request(app.getHttpServer()).post(`${apiPath}${existingFile.fullPath}`).attach('file', __filename);

				const existingFoundFile = await runner.manager.findOne(File, { where: { fullPath: existingFile.fullPath } });
				const pathExists = await FileUtils.pathExists(
					FileUtils.join(configService, existingFile.fullPath, Environment.DiskStoragePath)
				);

				expect(response.statusCode).toStrictEqual(409);
				expect(response.body).toStrictEqual(error);
				expect(existingFoundFile).toStrictEqual(existingFile);
				expect(pathExists).toBeFalsy();
			});
		});

		it('500 - something went wrong', async () => {
			jest.spyOn(fsPromises, 'writeFile').mockRejectedValueOnce(new Error());

			const path = 'test/test.txt';
			const error = { message: 'something went wrong', error: 'Internal Server Error', statusCode: 500 };

			const response = await request(app.getHttpServer()).post(`${apiPath}${path}`).attach('file', __filename);

			const file = await runner.manager.findOne(File, { where: { fullPath: path, isRecycled: false } });
			const pathExists = await FileUtils.pathExists(FileUtils.join(configService, path, Environment.DiskStoragePath));

			expect(response.statusCode).toStrictEqual(500);
			expect(response.body).toStrictEqual(error);
			expect(file).toBeNull();
			expect(pathExists).toBeFalsy();
		});
	});

	describe(`POST ${apiPath}:uuid/restore`, () => {
		describe('201 - file restored successfully', () => {
			it("should return 200 if file does not already exist and query param 'overwrite' is false", async () => {
				const file = new File('test/t.txt', 't.txt', 'test', 'text/plain', 11, true);
				const sourcePath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskRecyclePath);
				const destPath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskStoragePath);
				const body = { path: file.fullPath };

				await runner.manager.save(File, file);
				await FileUtils.writeFile(sourcePath, Buffer.from('testContent'));

				const response = await request(app.getHttpServer()).post(`${apiPath}${file.uuid}/restore?overwrite=false`);
				const updatedFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

				expect(response.statusCode).toStrictEqual(201);
				expect(response.body).toStrictEqual(body);
				expect(updatedFile?.updated).not.toStrictEqual(file.updated);
				expect({ ...updatedFile }).toStrictEqual({
					...file,
					isRecycled: false,
					updated: expect.any(Date),
				});
				await expect(FileUtils.pathExists(sourcePath)).resolves.toBeFalsy();
				await expect(FileUtils.pathExists(destPath)).resolves.toBeTruthy();
				await expect(fsPromises.readFile(destPath, { encoding: 'utf-8' })).resolves.toStrictEqual('testContent');
			});

			it("should return 200 if file does not already exist and query param 'overwrite' is not given", async () => {
				const file = new File('test/t.txt', 't.txt', 'test', 'text/plain', 11, true);
				const sourcePath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskRecyclePath);
				const destPath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskStoragePath);
				const body = { path: file.fullPath };

				await runner.manager.save(File, file);
				await FileUtils.writeFile(sourcePath, Buffer.from('testContent'));

				const response = await request(app.getHttpServer()).post(`${apiPath}${file.uuid}/restore`);
				const updatedFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

				expect(response.statusCode).toStrictEqual(201);
				expect(response.body).toStrictEqual(body);
				expect(updatedFile?.updated).not.toStrictEqual(file.updated);
				expect({ ...updatedFile }).toStrictEqual({
					...file,
					isRecycled: false,
					updated: expect.any(Date),
				});
				await expect(FileUtils.pathExists(sourcePath)).resolves.toBeFalsy();
				await expect(FileUtils.pathExists(destPath)).resolves.toBeTruthy();
				await expect(fsPromises.readFile(destPath, { encoding: 'utf-8' })).resolves.toStrictEqual('testContent');
			});

			it("should return 200 if file does not already exist and query param 'overwrite' is true", async () => {
				const file = new File('test/t.txt', 't.txt', 'test', 'text/plain', 11, true);
				const sourcePath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskRecyclePath);
				const destPath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskStoragePath);
				const body = { path: file.fullPath };

				await runner.manager.save(File, file);
				await FileUtils.writeFile(sourcePath, Buffer.from('testContent'));

				const response = await request(app.getHttpServer()).post(`${apiPath}${file.uuid}/restore?overwrite=true`);
				const updatedFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

				expect(response.statusCode).toStrictEqual(201);
				expect(response.body).toStrictEqual(body);
				expect(updatedFile?.updated).not.toStrictEqual(file.updated);
				expect({ ...updatedFile }).toStrictEqual({
					...file,
					isRecycled: false,
					updated: expect.any(Date),
				});
				await expect(FileUtils.pathExists(sourcePath)).resolves.toBeFalsy();
				await expect(FileUtils.pathExists(destPath)).resolves.toBeTruthy();
				await expect(fsPromises.readFile(destPath, { encoding: 'utf-8' })).resolves.toStrictEqual('testContent');
			});

			it("should return 200 if file does already exist and query param 'overwrite' is true", async () => {
				const file = new File('test/t.txt', 't.txt', 'test', 'text/plain', 11, true);
				const existingFile = new File('test/t.txt', 't.txt', 'test', 'text/plain', 12, false);
				const sourcePath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskRecyclePath);
				const destPath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskStoragePath);
				const body = { path: file.fullPath };

				await runner.manager.save(File, existingFile);
				await runner.manager.save(File, file);
				await FileUtils.writeFile(sourcePath, Buffer.from('testContent'));

				const response = await request(app.getHttpServer()).post(`${apiPath}${file.uuid}/restore?overwrite=true`);
				const updatedFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

				expect(response.statusCode).toStrictEqual(201);
				expect(response.body).toStrictEqual(body);
				expect(updatedFile?.updated).not.toStrictEqual(file.updated);
				expect({ ...updatedFile }).toStrictEqual({
					...file,
					isRecycled: false,
					updated: expect.any(Date),
				});
				await expect(FileUtils.pathExists(sourcePath)).resolves.toBeFalsy();
				await expect(FileUtils.pathExists(destPath)).resolves.toBeTruthy();
				await expect(fsPromises.readFile(destPath, { encoding: 'utf-8' })).resolves.toStrictEqual('testContent');
				await expect(runner.manager.findOne(File, { where: { uuid: existingFile.uuid } })).resolves.toBeNull();
			});
		});

		it('400 - path must be a valid file path', async () => {
			const uuid = 'anythingButAUuid';
			const error = { message: 'id must be a UUID', error: 'Bad Request', statusCode: 400 };

			const response = await request(app.getHttpServer()).post(`${apiPath}${uuid}/restore`);

			expect(response.statusCode).toStrictEqual(400);
			expect(response.body).toStrictEqual(error);
		});

		describe('404 - uuid does not exist', () => {
			it('should return 404 if uuid exists in db but is not recycled', async () => {
				const file = new File('test/t.txt', 't.txt', 'test', 'text/plain', 19, false);
				const error = { message: `uuid ${file.uuid} does not exist`, error: 'Not Found', statusCode: 404 };

				await runner.manager.save(File, file);
				const response = await request(app.getHttpServer()).post(`${apiPath}${file.uuid}/restore`);
				const foundFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

				expect(response.body).toStrictEqual(error);
				expect(response.statusCode).toStrictEqual(404);
				expect(foundFile?.isRecycled).toBeFalsy();
			});

			it('should return 404 if uuid does not exist in db at all', async () => {
				const uuid = generateUuid();
				const error = { message: `uuid ${uuid} does not exist`, error: 'Not Found', statusCode: 404 };

				const response = await request(app.getHttpServer()).post(`${apiPath}${uuid}/restore`);
				const foundFile = await runner.manager.findOne(File, { where: { uuid: uuid } });

				expect(response.body).toStrictEqual(error);
				expect(response.statusCode).toStrictEqual(404);
				expect(foundFile?.isRecycled).toBeFalsy();
			});
		});

		describe('409 - file already exists', () => {
			it("should return 409 if file does already exist and query param 'overwrite' is false", async () => {
				const fileToRestore = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 12, true);
				const existingFile = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 123, false);
				const error = { message: `file at ${fileToRestore.fullPath} already exists`, error: 'Conflict', statusCode: 409 };

				await runner.manager.save(File, fileToRestore);
				await runner.manager.save(File, existingFile);

				const response = await request(app.getHttpServer()).post(`${apiPath}${fileToRestore.uuid}/restore?overwrite=false`);

				const updatedFile = await runner.manager.findOne(File, { where: { uuid: fileToRestore.uuid } });
				const updatedExistingFile = await runner.manager.findOne(File, { where: { uuid: existingFile.uuid } });

				expect(response.statusCode).toStrictEqual(409);
				expect(response.body).toStrictEqual(error);
				expect(updatedFile).toStrictEqual(updatedFile);
				expect(updatedExistingFile).toStrictEqual(existingFile);
			});

			it("should return 409 if file does already exist and query param 'overwrite' is not given", async () => {
				const fileToRestore = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 12, true);
				const existingFile = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 123, false);
				const error = { message: `file at ${fileToRestore.fullPath} already exists`, error: 'Conflict', statusCode: 409 };

				await runner.manager.save(File, fileToRestore);
				await runner.manager.save(File, existingFile);

				const response = await request(app.getHttpServer()).post(`${apiPath}${fileToRestore.uuid}/restore`);

				const updatedFile = await runner.manager.findOne(File, { where: { uuid: fileToRestore.uuid } });
				const updatedExistingFile = await runner.manager.findOne(File, { where: { uuid: existingFile.uuid } });

				expect(response.statusCode).toStrictEqual(409);
				expect(response.body).toStrictEqual(error);
				expect(updatedFile).toStrictEqual(updatedFile);
				expect(updatedExistingFile).toStrictEqual(existingFile);
			});
		});

		it('500 - something went wrong', async () => {
			const file = new File('test/t.txt', 't.txt', 'test', 'text/plain', 69, true);
			const error = { message: 'something went wrong', error: 'Internal Server Error', statusCode: 500 };

			await runner.manager.save(File, file);

			const response = await request(app.getHttpServer()).post(`${apiPath}${file.uuid}/restore`);
			const foundFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

			expect(response.statusCode).toStrictEqual(500);
			expect(response.body).toStrictEqual(error);
			expect(foundFile).toStrictEqual(file);
		});
	});

	describe(`GET ${apiPath}:path/metadata`, () => {
		it('200 - get metadata', async () => {
			const path = 'test/t.txt';
			const file = new File(path, 't.txt', 'test', 'text/plain', 19);

			await runner.manager.save(File, file);

			const response = await request(app.getHttpServer()).get(`${apiPath}${path}/metadata`);

			expect(response.statusCode).toStrictEqual(200);
			expect(response.body).toStrictEqual({
				fullPath: file.fullPath,
				name: file.name,
				path: file.path,
				size: file.size,
				uuid: file.uuid,
				mimeType: file.mimeType,
				created: file.created.toISOString(),
				updated: file.updated.toISOString(),
			});
		});

		it('400 - path must be a valid file path', async () => {
			const path = '../../.t.txt';
			const error = { message: 'path must be a valid file path', error: 'Bad Request', statusCode: 400 };

			const response = await request(app.getHttpServer()).get(`${apiPath}${path}/metadata`);

			expect(response.statusCode).toStrictEqual(400);
			expect(response.body).toStrictEqual(error);
		});

		it('404 - file doest not exist', async () => {
			const path = 'test.txt';
			const error = { message: `file at ${path} does not exist`, error: 'Not Found', statusCode: 404 };

			const response = await request(app.getHttpServer()).get(`${apiPath}${path}/metadata`);

			expect(response.statusCode).toStrictEqual(404);
			expect(response.body).toStrictEqual(error);
		});

		it('500 - something went wrong', async () => {
			jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(mockedQueryRunner as unknown as QueryRunner);
			jest.spyOn(mockedQueryRunner.manager, 'findOne').mockRejectedValueOnce(null);

			const path = 'test.txt';
			const error = { message: 'something went wrong', error: 'Internal Server Error', statusCode: 500 };

			const response = await request(app.getHttpServer()).get(`${apiPath}${path}/metadata`);

			expect(response.statusCode).toStrictEqual(500);
			expect(response.body).toStrictEqual(error);
		});
	});

	describe(`GET ${apiPath}:path/download`, () => {
		it('200 - download success', async () => {
			const file = new File('test/t.txt', 't.txt', 'test', 'text/plain', 19);
			const content = Buffer.from('testContent');
			const sourcePath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskStoragePath);

			await FileUtils.writeFile(sourcePath, content);
			await runner.manager.save(File, file);

			const response = await request(app.getHttpServer()).get(`${apiPath}${file.fullPath}/download`).responseType('blob');

			const foundFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

			expect(response.statusCode).toStrictEqual(200);
			expect(response.body).toStrictEqual(content);
			expect(response.headers['content-disposition']).toStrictEqual('attachment; filename=t.txt');
			expect(response.headers['content-type']).toStrictEqual('text/plain; charset=utf-8');
			expect(file).toStrictEqual(foundFile);
		});

		it('400 - path must be a valid file path', async () => {
			const path = '../../t.txt';
			const error = { message: 'path must be a valid file path', statusCode: 400, error: 'Bad Request' };

			const response = await request(app.getHttpServer()).get(`${apiPath}${path}/download`);

			expect(response.statusCode).toStrictEqual(400);
			expect(response.body).toStrictEqual(error);
		});

		describe('404 - file does not exist', () => {
			it('should return 404 if file does not exist in db layer', async () => {
				const path = 'test.txt';
				const error = { message: `file at ${path} does not exist`, error: 'Not Found', statusCode: 404 };

				const response = await request(app.getHttpServer()).get(`${apiPath}${path}/download`);

				expect(response.statusCode).toStrictEqual(404);
				expect(response.body).toStrictEqual(error);
			});

			it('should return 404 if file does not exist in fs layer', async () => {
				const file = new File('test.txt', 'test.txt', '.', 'text/plain', 19);
				const error = { message: `file at ${file.fullPath} does not exist`, error: 'Not Found', statusCode: 404 };

				await runner.manager.save(File, file);

				const response = await request(app.getHttpServer()).get(`${apiPath}${file.fullPath}/download`);
				const foundFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

				expect(response.statusCode).toStrictEqual(404);
				expect(response.body).toStrictEqual(error);
				expect(file).toStrictEqual(foundFile);
			});
		});

		it('500 - something went wrong', async () => {
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValueOnce(true);

			const error = { message: 'something went wrong', error: 'Internal Server Error', statusCode: 500 };
			const file = new File('test/t.txt', 't.txt', 'test', 'text/plain', 19);

			await runner.manager.save(File, file);

			const response = await request(app.getHttpServer()).get(`${apiPath}${file.fullPath}/download`);

			const foundFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

			expect(response.statusCode).toStrictEqual(500);
			expect(response.body).toStrictEqual(error);
			expect(file).toStrictEqual(foundFile);
		});
	});

	describe(`PATCH ${apiPath}:path`, () => {
		describe('200 - file renamed successfully', () => {
			it("should return 200 if file does not already exist and query param 'overwrite' is not given", async () => {
				const fileToRename = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 11);
				const renamedFile = new File('a/b/c.csv', 'c.csv', 'a/b', 'text/csv', 11);

				await runner.manager.save(File, fileToRename);

				const response = await request(app.getHttpServer())
					.patch(`${apiPath}${fileToRename.fullPath}`)
					.send({ newPath: renamedFile.fullPath });

				const foundFile = await runner.manager.findOne(File, { where: { uuid: fileToRename.uuid } });

				expect(response.statusCode).toStrictEqual(200);
				expect(response.body).toStrictEqual({ path: renamedFile.fullPath });
				expect({ ...foundFile }).toStrictEqual({
					...renamedFile,
					uuid: fileToRename.uuid,
					created: fileToRename.created,
					updated: expect.any(Date),
				});
			});

			it("should return 200 if file does not already exist and query param 'overwrite' is false", async () => {
				const fileToRename = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 11);
				const renamedFile = new File('a/b/c.csv', 'c.csv', 'a/b', 'text/csv', 11);

				await runner.manager.save(File, fileToRename);

				const response = await request(app.getHttpServer())
					.patch(`${apiPath}${fileToRename.fullPath}?overwrite=false`)
					.send({ newPath: renamedFile.fullPath });

				const foundFile = await runner.manager.findOne(File, { where: { uuid: fileToRename.uuid } });

				expect(response.statusCode).toStrictEqual(200);
				expect(response.body).toStrictEqual({ path: renamedFile.fullPath });
				expect({ ...foundFile }).toStrictEqual({
					...renamedFile,
					uuid: fileToRename.uuid,
					created: fileToRename.created,
					updated: expect.any(Date),
				});
			});

			it("should return 200 if file does not already exist and query param 'overwrite' is true", async () => {
				const fileToRename = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 11);
				const renamedFile = new File('a/b/c.csv', 'c.csv', 'a/b', 'text/csv', 11);

				await runner.manager.save(File, fileToRename);

				const response = await request(app.getHttpServer())
					.patch(`${apiPath}${fileToRename.fullPath}?overwrite=true`)
					.send({ newPath: renamedFile.fullPath });

				const foundFile = await runner.manager.findOne(File, { where: { uuid: fileToRename.uuid } });

				expect(response.statusCode).toStrictEqual(200);
				expect(response.body).toStrictEqual({ path: renamedFile.fullPath });
				expect({ ...foundFile }).toStrictEqual({
					...renamedFile,
					uuid: fileToRename.uuid,
					created: fileToRename.created,
					updated: expect.any(Date),
				});
			});

			it("should return 200 if file does already exist and query param 'overwrite' is true", async () => {
				const fileToRename = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 11);
				const existingFile = new File('a/b/c.csv', 'c.csv', 'a/b', 'text/csv', 11);

				await runner.manager.save(File, fileToRename);
				await runner.manager.save(File, existingFile);

				const response = await request(app.getHttpServer())
					.patch(`${apiPath}${fileToRename.fullPath}?overwrite=true`)
					.send({ newPath: existingFile.fullPath });

				const foundFile = await runner.manager.findOne(File, { where: { uuid: fileToRename.uuid } });
				const foundExistingFile = await runner.manager.findOne(File, { where: { uuid: existingFile.uuid } });

				expect(response.statusCode).toStrictEqual(200);
				expect(response.body).toStrictEqual({ path: existingFile.fullPath });
				expect(foundExistingFile).toBeNull();
				expect({ ...foundFile }).toStrictEqual({
					...existingFile,
					uuid: fileToRename.uuid,
					created: fileToRename.created,
					updated: expect.any(Date),
				});
			});
		});

		it('400 - path must be a valid file path', async () => {
			const path = '../../../test.txt';
			const error = { message: 'path must be a valid file path', error: 'Bad Request', statusCode: 400 };

			const response = await request(app.getHttpServer()).patch(`${apiPath}${path}`).send({ newPath: 't.txt' });

			expect(response.statusCode).toStrictEqual(400);
			expect(response.body).toStrictEqual(error);
		});

		describe('400 - newPath must be a valid file path', () => {
			it('should return 400 if newPath is not relative', async () => {
				const file = new File('test/t.txt', 't.txt', 'test', 'text/plain', 11);
				const error = { message: 'newPath must be a valid file path', error: 'Bad Request', statusCode: 400 };
				const newPath = '../../../test.txt';

				await runner.manager.save(File, file);

				TestValidationPipe.disable();

				const response = await request(app.getHttpServer()).patch(`${apiPath}${file.fullPath}`).send({ newPath: newPath });

				const foundFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

				TestValidationPipe.enable();

				expect(response.statusCode).toStrictEqual(400);
				expect(response.body).toStrictEqual(error);
				expect(file).toStrictEqual(foundFile);
			});

			it('should return 400 if newPath does not pass validation pipe', async () => {
				const file = new File('test/t.txt', 't.txt', 'test', 'text/plain', 11);
				const error = { message: 'newPath must be a valid file path', error: 'Bad Request', statusCode: 400 };
				const newPath = '../../../test.txt';

				await runner.manager.save(File, file);

				const response = await request(app.getHttpServer()).patch(`${apiPath}${file.fullPath}`).send({ newPath: newPath });

				const foundFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });

				expect(response.statusCode).toStrictEqual(400);
				expect(response.body).toStrictEqual(error);
				expect(file).toStrictEqual(foundFile);
			});
		});

		it('404 - file does not exist', async () => {
			const path = 'test/t.txt';
			const error = { message: `file at ${path} does not exist`, error: 'Not Found', statusCode: 404 };

			const response = await request(app.getHttpServer()).patch(`${apiPath}${path}`).send({ newPath: 'file/test.txt' });

			expect(response.body).toStrictEqual(error);
			expect(response.statusCode).toStrictEqual(404);
		});

		describe('409 - file already exists', () => {
			it("should return 409 if file already exists and query param 'overwrite' is false", async () => {
				const fileToRename = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 11);
				const existingFile = new File('test/b.txt', 'b.txt', 'test', 'text/plain', 19);
				const error = { message: `file at ${existingFile.fullPath} already exists`, error: 'Conflict', statusCode: 409 };

				await runner.manager.save(File, fileToRename);
				await runner.manager.save(File, existingFile);

				const response = await request(app.getHttpServer())
					.patch(`${apiPath}${fileToRename.fullPath}?overwrite=false`)
					.send({ newPath: existingFile.fullPath });

				const foundFile = await runner.manager.findOne(File, { where: { uuid: fileToRename.uuid } });
				const foundExistingFile = await runner.manager.findOne(File, { where: { uuid: existingFile.uuid } });

				expect(response.body).toStrictEqual(error);
				expect(response.statusCode).toStrictEqual(409);
				expect(foundFile).toStrictEqual(fileToRename);
				expect(foundExistingFile).toStrictEqual(existingFile);
			});

			it("should return 409 if file already exists and query param 'overwrite' is not given", async () => {
				const fileToRename = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 11);
				const existingFile = new File('test/b.txt', 'b.txt', 'test', 'text/plain', 19);
				const error = { message: `file at ${existingFile.fullPath} already exists`, error: 'Conflict', statusCode: 409 };

				await runner.manager.save(File, fileToRename);
				await runner.manager.save(File, existingFile);

				const response = await request(app.getHttpServer())
					.patch(`${apiPath}${fileToRename.fullPath}`)
					.send({ newPath: existingFile.fullPath });

				const foundFile = await runner.manager.findOne(File, { where: { uuid: fileToRename.uuid } });
				const foundExistingFile = await runner.manager.findOne(File, { where: { uuid: existingFile.uuid } });

				expect(response.body).toStrictEqual(error);
				expect(response.statusCode).toStrictEqual(409);
				expect(foundFile).toStrictEqual(fileToRename);
				expect(foundExistingFile).toStrictEqual(existingFile);
			});
		});

		it('500 - something went wrong', async () => {
			const localRunner = dataSource.createQueryRunner();
			jest.spyOn(dataSource, 'createQueryRunner').mockReturnValueOnce(localRunner);
			jest.spyOn(localRunner.manager, 'save').mockRejectedValueOnce(null);

			const file = new File('test/a.txt', 'a.txt', 'test', 'text/plain', 11);
			const error = { message: 'something went wrong', error: 'Internal Server Error', statusCode: 500 };

			await runner.manager.save(File, file);

			const response = await request(app.getHttpServer()).patch(`${apiPath}${file.fullPath}`).send({ newPath: 'test/b.txt' });

			const foundFile = await runner.manager.findOne(File, { where: { uuid: file.uuid } });
			await localRunner.release();

			expect(response.statusCode).toStrictEqual(500);
			expect(response.body).toStrictEqual(error);
			expect(file).toStrictEqual(foundFile);
		});
	});

	describe(`DELETE ${apiPath}:path`, () => {
		describe('200 - delete success', () => {
			it('should set isRecycled to true and delete file', async () => {
				const path = 'test.txt';
				const file = new File(path, 'test.txt', '.', 'text/plain', 19);
				const body = { uuid: file.uuid };

				const fileSourcePath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskStoragePath);
				const fileDestinationPath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskRecyclePath);

				await runner.manager.save(File, file);
				await FileUtils.writeFile(
					FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskStoragePath),
					Buffer.from('test')
				);

				const response = await request(app.getHttpServer()).delete(`${apiPath}${path}`);

				const foundFile = await runner.manager.findOne(File, { where: { fullPath: path } });
				const sourcePathExists = await FileUtils.pathExists(fileSourcePath);
				const destinationPathExists = await FileUtils.pathExists(fileDestinationPath);

				expect(response.statusCode).toStrictEqual(200);
				expect(response.body).toStrictEqual(body);
				expect(foundFile?.isRecycled).toBeTruthy();
				expect(sourcePathExists).toBeFalsy();
				expect(destinationPathExists).toBeTruthy();
			});

			it("should set isRecycled to true and don't fail if deleting fails", async () => {
				jest.spyOn(fsPromises, 'rm').mockRejectedValueOnce(null);

				const path = 'test.txt';
				const file = new File(path, 'test.txt', '.', 'text/plain', 19);
				const body = { uuid: file.uuid };

				const fileSourcePath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskStoragePath);
				const fileDestinationPath = FileUtils.join(configService, file.getUuidAsDirPath(), Environment.DiskRecyclePath);

				await runner.manager.save(File, file);
				await FileUtils.writeFile(fileSourcePath, Buffer.from('test'));

				const response = await request(app.getHttpServer()).delete(`${apiPath}${path}`);
				const foundFile = await runner.manager.findOne(File, { where: { fullPath: path } });
				const sourcePathExists = await FileUtils.pathExists(fileSourcePath);
				const destinationPathExists = await FileUtils.pathExists(fileDestinationPath);

				expect(response.statusCode).toStrictEqual(200);
				expect(response.body).toStrictEqual(body);
				expect(foundFile?.isRecycled).toBeTruthy();
				expect(sourcePathExists).toBeTruthy();
				expect(destinationPathExists).toBeTruthy();
			});
		});

		it('400 - path must be a valid file path', async () => {
			const path = '../../.t.txt';
			const error = { message: 'path must be a valid file path', error: 'Bad Request', statusCode: 400 };

			const response = await request(app.getHttpServer()).delete(`${apiPath}${path}`);

			expect(response.statusCode).toStrictEqual(400);
			expect(response.body).toStrictEqual(error);
		});

		it('404 - file does not exist', async () => {
			const path = 'test/t.txt';
			const error = { message: `file at ${path} does not exist`, error: 'Not Found', statusCode: 404 };

			const response = await request(app.getHttpServer()).delete(`${apiPath}${path}`);

			expect(response.statusCode).toStrictEqual(404);
			expect(response.body).toStrictEqual(error);
		});

		it('500 - something went wrong', async () => {
			jest.spyOn(FileUtils, 'copyFile').mockRejectedValueOnce(null);

			const path = 'test.txt';
			const file = new File(path, 'test.txt', '.', 'text/plain', 19);
			const error = { message: 'something went wrong', error: 'Internal Server Error', statusCode: 500 };

			await runner.manager.save(File, file);

			const response = await request(app.getHttpServer()).delete(`${apiPath}${path}`);

			const foundFile = await runner.manager.findOne(File, { where: { fullPath: path } });

			expect(response.statusCode).toStrictEqual(500);
			expect(response.body).toStrictEqual(error);
			expect(foundFile).toStrictEqual(file);
		});
	});
});
