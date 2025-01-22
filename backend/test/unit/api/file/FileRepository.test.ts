import { EntityManager } from '@mikro-orm/mariadb';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { FileRepository } from 'src/modules/files/files.repository';
import { IFileRepository } from 'src/modules/files/IFilesRepository';

import config from 'src/config/mikro-orm.config';
import { DIRECTORY_TABLE_NAME } from 'src/db/entities/directory.entity';
import { FILES_TABLE_NAME } from 'src/db/entities/file.entity';

describe('FileRepository', () => {
	let repository: FileRepository;
	let globalEntityManager: EntityManager;
	let entityManager: EntityManager;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [MikroOrmModule.forRoot({ ...config })],
			providers: [
				{
					provide: IFileRepository,
					useClass: FileRepository,
				},
			],
		}).compile();

		module.useLogger(false);

		globalEntityManager = module.get(EntityManager);
		repository = module.get(IFileRepository);

		await globalEntityManager.begin();
	});

	afterAll(async () => {
		await globalEntityManager.rollback();
		await globalEntityManager.getConnection().close();
	});

	beforeEach(async () => {
		entityManager = globalEntityManager.fork();
		await entityManager.begin();
	});

	afterEach(async () => {
		await entityManager.rollback();
	});

	describe('GET_FILE_PATH', () => {
		it(`should return NULL if id is NULL`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_FILE_PATH(NULL) as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toBeNull();
		});

		it('should return NULL if id does not exist', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_FILE_PATH('test') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toBeNull();
		});

		it('should return correct path for first level file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${FILES_TABLE_NAME} (id, name, parentId)
					 VALUES ('rootId', 'root.txt',  'root')`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_FILE_PATH('rootId') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/root/root.txt');
		});

		it('should return correct path for nested file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME}
                            (id,          name,     parentId)
					 VALUES ('parentId', 'parent', 'root'),
					        ('child1Id', 'child1', 'parentId'),
							('child2Id', 'child2', 'child1Id');

                     INSERT INTO ${FILES_TABLE_NAME}
                            (id,        name,       parentId)
                     VALUES ('fileId', 'file.txt', 'child2Id');`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_FILE_PATH('fileId') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/root/parent/child1/child2/file.txt');
		});
	});

	describe('GET_FILE_UUID', () => {
		it('should return NULL if path is NULL', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_FILE_UUID(NULL) as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toBeNull();
		});

		it(`should return NULL if path is ''`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_FILE_UUID('') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toBeNull();
		});

		it(`should return NULL if path is '/'`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_FILE_UUID('/') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toBeNull();
		});

		it('should return NULL if path does not exist', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_FILE_UUID('test') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toBeNull();
		});

		it('should return correct id for first level file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${FILES_TABLE_NAME} (id, name, parentId)
				      VALUES ('file1Id', 'test1.txt', 'root'),
					         ('file2Id', 'test2.txt', 'root')`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_FILE_UUID('/test1.txt') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('file1Id');
		});

		it('should return correct id for nested file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME}
                             (id,          name,     parentId )
				      VALUES ('parentId', 'parent', 'root'    ),
					         ('child1Id', 'child1', 'parentId'),
							 ('child2Id', 'child2', 'child1Id');

                     INSERT INTO ${FILES_TABLE_NAME}
                            (id,        name,       parentId )
                     VALUES ('fileId', 'file.txt', 'child2Id')`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_FILE_UUID('/parent/child1/child2/file.txt') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('fileId');
		});
	});

	describe('GET_UPMOST_DIRNAME', () => {
		it('should return NULL if path is NULL', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME(NULL) as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toBeNull();
		});

		it(`should return NULL if path is ''`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME('') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toBeNull();
		});

		it(`should return '' if path is '/'`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME('/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('');
		});

		it('should return correct dirname if path has no leading slash', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME('parent/dist/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('parent');
		});

		it(`should return '' if path has a single leading slash`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME('/parent/dist/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('');
		});

		it(`should return '' if path has multiple leading slashes`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME('///parent/dist/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('');
		});
	});

	describe('GET_PATH_AFTER_UPMOST_DIRNAME', () => {
		it('should return NULL if path is NULL', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME(NULL) as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toBeNull();
		});

		it(`should return NULL if path is ''`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME('') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toBeNull();
		});

		it(`should return NULL if path is '/'`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME('/') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('');
		});

		it('should return correct path if path has no leading slash', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME('parent/dist/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('dist/');
		});

		it('should return correct path if path has a single leading slash', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME('/parent/dist/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('parent/dist/');
		});

		it('should return correct path if path has multiple leading slashes', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME('///parent/dist/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('//parent/dist/');
		});
	});

	describe('insertReturningId', () => {
		it('should insert an entity with the root as parent', async () => {
			await expect(repository.insertReturningId(entityManager, 'file.txt', 'text/plain', 19, 'root')).resolves.toStrictEqual({ id: expect.any(String) });

			const [entities] = await entityManager
				.getKnex()
				.raw<[File[]]>(`SELECT * FROM ${FILES_TABLE_NAME}`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities).toStrictEqual([
				{
					id: expect.any(String),
					name: 'file.txt',
					mimeType: 'text/plain',
					size: 19,
					parentId: 'root',
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);
		});

		it('should throw an error if parent does not exist', async () => {
			await expect(repository.insertReturningId(entityManager, 'file.txt', 'text/plain', 0, 'parent')).rejects.toThrow();

			const [entities] = await entityManager
				.getKnex()
				.raw<[File[]]>(`SELECT * FROM ${FILES_TABLE_NAME}`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities).toStrictEqual([]);
		});

		it(`should insert the entity with a parent different than 'root'`, async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.insertReturningId(entityManager, 'file.txt', 'text/plain', 19, 'parentId')).resolves.toStrictEqual({
				id: expect.any(String),
			});

			const [entities] = await entityManager
				.getKnex()
				.raw<[File[]]>(`SELECT * FROM ${FILES_TABLE_NAME}`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities).toStrictEqual([
				{
					id: expect.any(String),
					name: 'file.txt',
					mimeType: 'text/plain',
					size: 19,
					parentId: 'parentId',
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);
		});

		it('should insert two entities with same name but different parent and not throw', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.insertReturningId(entityManager, 'file.txt', 'text/plain', 11, 'parentId')).resolves.not.toThrow();
			await expect(repository.insertReturningId(entityManager, 'file.txt', 'text/csv', 11, 'root')).resolves.not.toThrow();
		});

		it('should throw an error if entity with the same name already exists', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${FILES_TABLE_NAME} (name, mimeType, size, parentId) VALUES ('file.txt', 'text/plain', 11, 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.insertReturningId(entityManager, 'file.txt', 'text/plain', 11, 'root')).rejects.toThrow();
		});
	});

	describe('exists', () => {
		it('should return false if the file does not exist', async () => {
			await expect(repository.exists(entityManager, '')).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, '/')).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, 'test.txt')).resolves.toBeFalsy();
		});

		it('should return true if the file exists (first level)', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${FILES_TABLE_NAME} (name, parentId) VALUES ('test.txt', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.exists(entityManager, 'test.txt')).resolves.toBeTruthy();
		});

		it('should return true if the file exists (nested)', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME}
				            (id,          name,     parentId)
					 VALUES ('parentId', 'parent', 'root');

					 INSERT INTO ${FILES_TABLE_NAME}
					        (name,        parentId)
					 VALUES ('file.txt', 'parentId');`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.exists(entityManager, 'parent/file.txt')).resolves.toBeTruthy();
		});
	});

	describe('select', () => {
		it('should return null if file does not exist', async () => {
			await expect(repository.select(entityManager, 'file.txt')).resolves.toBeNull();
		});

		it('should return correct data for first level file', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${FILES_TABLE_NAME} (name, mimeType, size, parentId) VALUES ('file.txt', 'text/plain', 128, 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.select(entityManager, 'file.txt')).resolves.toStrictEqual({
				id: expect.any(String),
				name: 'file.txt',
				mimeType: 'text/plain',
			});
		});

		it('should return correct data for nested file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', 'root');
			         INSERT INTO ${FILES_TABLE_NAME} (name, mimeType, size, parentId) VALUES ('file.txt', 'text/plain', 128, 'parentId')`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.select(entityManager, 'parent/file.txt')).resolves.toStrictEqual({
				id: expect.any(String),
				name: 'file.txt',
				mimeType: 'text/plain',
			});
		});
	});

	describe('getMetadata', () => {
		it('should return null if the file does not exist', async () => {
			await expect(repository.getMetadata(entityManager, 'test/file.txt')).resolves.toBeNull();
		});

		it('should return correct metadata for first level file', async () => {
			const expectedMetadata = {
				id: expect.any(String),
				name: 'file.txt',
				mimeType: 'text/plain',
				size: 129,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			};

			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${FILES_TABLE_NAME} (name, mimeType, size, parentId) VALUES ('file.txt', 'text/plain', 129, 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.getMetadata(entityManager, 'file.txt')).resolves.toStrictEqual(expectedMetadata);
		});

		it('should return correct metadata for nested file', async () => {
			const expectedMetadata = {
				id: expect.any(String),
				name: 'file.txt',
				mimeType: 'text/plain',
				size: 129,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			};

			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', 'root');
					 INSERT INTO ${FILES_TABLE_NAME} (name, mimeType, size, parentId) VALUES ('file.txt', 'text/plain', 129, 'parentId')`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.getMetadata(entityManager, 'parent/file.txt')).resolves.toStrictEqual(expectedMetadata);
		});
	});

	describe('update', () => {
		it('should update nothing if supplied with empty partial', async () => {
			const spy = jest.spyOn(entityManager, 'getKnex');

			await repository.update(entityManager, 'path', {});

			expect(spy).not.toHaveBeenCalled();
		});

		it('should update nothing but not throw if file with that path does not exist', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${FILES_TABLE_NAME} (name, mimeType, size, parentId) VALUES ('file.txt', 'text/plain', 128, 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await repository.update(entityManager, 'parent/file.txt', { name: 'file' });

			const [files] = await entityManager.getKnex().raw(`SELECT * FROM ${FILES_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(files).toStrictEqual([
				{
					id: expect.any(String),
					name: 'file.txt',
					mimeType: 'text/plain',
					parentId: 'root',
					size: 128,
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);
		});

		it('should throw if parentId does not exist', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${FILES_TABLE_NAME} (name, parentId) VALUES ('file.txt', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.update(entityManager, 'file.txt', { name: 'file.csv', parentId: 'parentId' })).rejects.toThrow();
		});

		it('should update name, and parentId of first level file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${FILES_TABLE_NAME} (name, mimeType, size, parentId) VALUES ('file.txt', 'text/plain', 128, 'root');
					 INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', 'root')`
				)
				.transacting(entityManager.getTransactionContext()!);

			await repository.update(entityManager, 'file.txt', { name: 'file.csv', parentId: 'parentId' });

			const [files] = await entityManager.getKnex().raw(`SELECT * FROM ${FILES_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(files).toStrictEqual([
				{
					id: expect.any(String),
					name: 'file.csv',
					mimeType: 'text/plain',
					parentId: 'parentId',
					size: 128,
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);
		});
	});

	describe('deleteById', () => {
		it('should not delete anything if file with that id does not exist', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${FILES_TABLE_NAME} (id, name, mimeType, size, parentId) VALUES ('id', 'file.txt', 'text/plain', 129, 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.deleteById(entityManager, 'testId')).resolves.not.toThrow();

			const [files] = await entityManager.getKnex().raw(`SELECT * FROM ${FILES_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(files).toStrictEqual([
				{
					id: 'id',
					name: 'file.txt',
					mimeType: 'text/plain',
					parentId: 'root',
					size: 129,
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);
		});

		it('should delete the file with that id if it exists', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${FILES_TABLE_NAME} (id, name, mimeType, size, parentId) VALUES ('id', 'file.txt', 'text/plain', 129, 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.deleteById(entityManager, 'id')).resolves.not.toThrow();

			const [files] = await entityManager.getKnex().raw(`SELECT * FROM ${FILES_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(files).toStrictEqual([]);
		});
	});

	describe('deleteByPath', () => {
		it('should not delete anything if file with that path does not exist', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${FILES_TABLE_NAME} (name, mimeType, size, parentId) VALUES ('file.txt', 'text/plain', 129, 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.deleteByPath(entityManager, 'test')).resolves.not.toThrow();

			const [files] = await entityManager.getKnex().raw(`SELECT * FROM ${FILES_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(files).toStrictEqual([
				{
					id: expect.any(String),
					name: 'file.txt',
					mimeType: 'text/plain',
					parentId: 'root',
					size: 129,
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);
		});

		it('should delete first level file if it exists', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${FILES_TABLE_NAME} (name, mimeType, size, parentId) VALUES ('file.txt', 'text/plain', 129, 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.deleteByPath(entityManager, 'file.txt')).resolves.not.toThrow();

			const [files] = await entityManager.getKnex().raw(`SELECT * FROM ${FILES_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(files).toStrictEqual([]);
		});

		it('should delete nested level file if it exists', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', 'root');
					 INSERT INTO ${FILES_TABLE_NAME} (name, mimeType, size, parentId) VALUES ('file.txt', 'text/plain', 129, 'parentId')`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.deleteByPath(entityManager, 'parent/file.txt')).resolves.not.toThrow();

			const [files] = await entityManager.getKnex().raw(`SELECT * FROM ${FILES_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(files).toStrictEqual([]);
		});
	});
});
