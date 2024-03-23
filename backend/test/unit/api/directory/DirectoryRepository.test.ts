import { EntityManager } from '@mikro-orm/mariadb';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectoryRepository } from 'src/api/directory/DirectoryRepository';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';

import config from 'src/config/MikroORMConfig';
import { DIRECTORY_TABLE_NAME } from 'src/db/entities/Directory';
import { FILES_TABLE_NAME } from 'src/db/entities/File';

describe('DirectoryRepository', () => {
	let repository: DirectoryRepository;
	let globalEntityManager: EntityManager;
	let entityManager: EntityManager;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [MikroOrmModule.forRoot({ ...config })],
			providers: [
				{
					provide: IDirectoryRepository,
					useClass: DirectoryRepository,
				},
			],
		}).compile();

		module.useLogger(false);

		globalEntityManager = module.get(EntityManager);
		repository = module.get(IDirectoryRepository);

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

	describe('GET_DIRECTORY_PATH', () => {
		it(`should return '/' if id is NULL`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH(NULL) as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/');
		});

		it('should return NULL if id does not exist', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH('test') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toBeNull();
		});

		it('should return correct path for first level directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
							(id,        name,   parentId)
					 VALUES ('rootId', 'root',  NULL    )`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH('rootId') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/root/');
		});

		it('should return correct path for nested  directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
					        (id,          name,     parentId )
					 VALUES ('parentId', 'parent',  NULL     ),
					        ('child1Id', 'child1', 'parentId'),
							('child2Id', 'child2', 'child1Id')`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH('child2Id') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/parent/child1/child2/');
		});
	});

	describe('GET_DIRECTORY_SIZE', () => {
		it('should return zero if directory does not exist', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ size: number }>]>(`SELECT GET_DIRECTORY_SIZE('test') as size`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.size).toStrictEqual(0);
		});

		it('should return zero if passed NULL as id', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ size: number }>]>(`SELECT GET_DIRECTORY_SIZE(NULL) as size`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.size).toStrictEqual(0);
		});

		it('should return zero if directory has no files and no subdirectories with files', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
							 (id,          name,     parentId )
					  VALUES ('parentId', 'parent',  NULL     ),
					         ('child1Id', 'child1', 'parentId'),
							 ('child2Id', 'child2', 'parentId'),
							 ('child3Id', 'child3', 'child1Id'),
							 ('child4Id', 'child4', 'child1Id')`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ size: number }>]>(`SELECT GET_DIRECTORY_SIZE('parentId') as size`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.size).toStrictEqual(0);
		});

		it('should return correct size', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
						    (id,          name,     parentId )
					 VALUES ('parentId', 'parent',  NULL     ),
					        ('child1Id', 'child1', 'parentId'),
					        ('child2Id', 'child2', 'parentId'),
							('child3Id', 'child3', 'child1Id'),
							('child4Id', 'child4', 'child1Id'),
							('child5Id', 'child5', 'child2Id'),
							('child6Id', 'child6', 'child2Id');
					  
					INSERT INTO ${FILES_TABLE_NAME} 
						   (name,     parentId,  size)
					VALUES ('file0', 'parentId', 11  ),
						   ('file1', 'child1Id', 12  ),
						   ('file2', 'child2Id', 13  ),
						   ('file3', 'child3Id', 14  ),
						   ('file4', 'child4Id', 15  ),
						   ('file5', 'child5Id', 16  ),
						   ('file6', 'child6Id', 17  );`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ size: number }>]>(`SELECT GET_DIRECTORY_SIZE('parentId') as size`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.size).toStrictEqual(98);
		});
	});

	describe('GET_DIRECTORY_UUID', () => {
		it('should return NULL if path is NULL', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID(NULL) as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toBeNull();
		});

		it(`should return NULL if path is '/'`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID('/') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toBeNull();
		});

		it('should return NULL if path does not exist', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID('test') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toBeNull();
		});

		it('should return correct id for first level directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME}  
						    (id,         name,   parentId) 
				      VALUES ('test1Id', 'test', NULL    ), 
					         ('test2Id', 'test', NULL    )`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID('test') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('test1Id');
		});

		it('should return correct id for nested directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
						     (id,          name,     parentId ) 
				      VALUES ('parentId', 'parent',  NULL     ), 
					         ('child1Id', 'child1', 'parentId'),
							 ('child2Id', 'child2', 'child1Id')`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID('/parent/child1/child2') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('child2Id');
		});
	});

	describe('insert', () => {
		it('should insert an entity with parentId=NULL, name and auto generated id, updatedAt and generatedAt', async () => {
			await expect(repository.insert(entityManager, 'testName', null)).resolves.not.toThrow();

			const [entities] = await entityManager.getKnex().raw(`SELECT * FROM ${DIRECTORY_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(entities).toStrictEqual([
				{
					name: 'testName',
					parentId: null,
					id: expect.any(String),
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);
		});

		it('should not insert an entity whose parent id is not represented in the db', async () => {
			await expect(repository.insert(entityManager, 'testName', 'jklfs23')).rejects.toThrow();

			const [entities] = await entityManager.getKnex().raw(`SELECT * FROM ${DIRECTORY_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(entities).toStrictEqual([]);
		});

		it('should insert an entity with correct parent id if the parent is represented in the db', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', NULL)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.insert(entityManager, 'testName', 'parentId')).resolves.not.toThrow();

			const [inserted] = await entityManager
				.getKnex()
				.raw(`SELECT * FROM ${DIRECTORY_TABLE_NAME} WHERE name='testName'`)
				.transacting(entityManager.getTransactionContext()!);

			expect(inserted).toStrictEqual([
				{
					name: 'testName',
					parentId: 'parentId',
					id: expect.any(String),
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);
		});
	});

	describe('exists', () => {
		it('should return false if no directory with that path exists', async () => {
			await expect(repository.exists(entityManager, null as any)).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, '')).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, 'test')).resolves.toBeFalsy();
		});

		it('should return true if the directory exists', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId) VALUES ('test', NULL)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.exists(entityManager, 'test')).resolves.toBeTruthy();
		});
	});

	describe('select', () => {
		it('should return NULL if no directory with that path exists', async () => {
			await expect(repository.select(entityManager, null as any)).resolves.toBeNull();
			await expect(repository.select(entityManager, '')).resolves.toBeNull();
			await expect(repository.select(entityManager, 'test')).resolves.toBeNull();
		});

		it('should return the correct name and id of the directory', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('testId', 'test', NULL);`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.select(entityManager, 'test')).resolves.toStrictEqual({
				name: 'test',
				id: 'testId',
			});
		});
	});

	describe('getMetadata', () => {
		it('should return NULL if directory does not exist', async () => {
			await expect(repository.getMetadata(entityManager, 'test')).resolves.toBeNull();
		});

		it('should return metadata with size zero, no files and no directories', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', NULL)`)
				.transacting(entityManager.getTransactionContext()!);

			const metadata = await repository.getMetadata(entityManager, 'parent');

			expect(metadata).toStrictEqual({
				id: 'parentId',
				name: 'parent',
				size: 0,
				directories: 0,
				files: 0,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});
		});

		it('should return metadata with correct size, files and directories', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
						    (id,          name,     parentId )
					 VALUES ('parentId', 'parent',  NULL     ),
					        ('child1Id', 'child1', 'parentId'),
					        ('child2Id', 'child2', 'parentId'),
							('child3Id', 'child3', 'child1Id'),
							('child4Id', 'child4', 'child1Id'),
							('child5Id', 'child5', 'child2Id'),
							('child6Id', 'child6', 'child2Id');
					  
					INSERT INTO ${FILES_TABLE_NAME} 
						   (name,     parentId,  size)
					VALUES ('file0', 'parentId', 11  ),
						   ('file1', 'child1Id', 12  ),
						   ('file2', 'child2Id', 13  ),
						   ('file3', 'child3Id', 14  ),
						   ('file4', 'child4Id', 15  ),
						   ('file5', 'child5Id', 16  ),
						   ('file6', 'child6Id', 17  );`
				)
				.transacting(entityManager.getTransactionContext()!);

			const metadata = await repository.getMetadata(entityManager, 'parent');

			expect(metadata).toStrictEqual({
				id: 'parentId',
				name: 'parent',
				size: 98,
				directories: 6,
				files: 7,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});
		});
	});

	describe('getContent', () => {
		it('should return empty arrays if directory does not exist', async () => {
			await expect(repository.getContent(entityManager, 'test')).resolves.toStrictEqual({
				files: [],
				directories: [],
			});
		});

		it('should return empty arrays if directory has no subdirectories or files', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId) VALUES ('test', NULL)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.getContent(entityManager, 'test')).resolves.toStrictEqual({
				files: [],
				directories: [],
			});
		});

		it('should return correct files and directories', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME}
						    (id,          name,     parentId )
					 VALUES ('parentId', 'parent',  NULL     ),
					        ('child1Id', 'child1', 'parentId'),
					        ('child2Id', 'child2', 'parentId');
					  
					INSERT INTO ${FILES_TABLE_NAME} 
						   (id,          name,   parentId,   mimeType,    size)
					VALUES ('file0Id', 'file0', 'parentId', 'text/plain', 11),
						   ('file1Id', 'file1', 'child1Id', 'text/csv', 12),
						   ('file2Id', 'file2', 'child2Id', 'application/json', 13);`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.getContent(entityManager, 'parent')).resolves.toStrictEqual({
				files: [{ id: 'file0Id', name: 'file0', size: 11, mimeType: 'text/plain', createdAt: expect.any(Date), updatedAt: expect.any(Date) }],
				directories: [
					{ id: 'child1Id', name: 'child1', size: 12, createdAt: expect.any(Date), updatedAt: expect.any(Date) },
					{ id: 'child2Id', name: 'child2', size: 13, createdAt: expect.any(Date), updatedAt: expect.any(Date) },
				],
			});
		});
	});

	describe('getFilesRelative', () => {
		it('should return empty array if directory does not exist', async () => {
			await expect(repository.getFilesRelative(entityManager, 'test')).resolves.toStrictEqual([]);
		});

		it('should return empty array if directory does not contain any files', async () => {
			await entityManager.getKnex().raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name) VALUES ('test')`).transacting(entityManager.getTransactionContext()!);

			await expect(repository.getFilesRelative(entityManager, 'test')).resolves.toStrictEqual([]);
		});

		it('should return array of files with correct path and id', async () => {
			const sortFunction = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);

			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
							(id,          name,     parentId)
					 VALUES ('parentId', 'parent',  NULL     ),
					        ('child1Id', 'child1', 'parentId'),
					        ('child2Id', 'child2', 'parentId'),
							('child3Id', 'child3', 'child1Id'),
							('child4Id', 'child4', 'child1Id'),
							('child5Id', 'child5', 'child2Id'),
							('child6Id', 'child6', 'child2Id');
					  
					INSERT INTO ${FILES_TABLE_NAME} 
						   (id,         name,    parentId,  size)
					VALUES ('file0Id', 'file0', 'parentId', 12),
						   ('file1Id', 'file1', 'child1Id', 16),
						   ('file2Id', 'file2', 'child2Id', 14),
						   ('file3Id', 'file3', 'child3Id', 19),
						   ('file4Id', 'file4', 'child4Id', 9),
						   ('file5Id', 'file5', 'child5Id', 7),
						   ('file6Id', 'file6', 'child6Id', 3);`
				)
				.transacting(entityManager.getTransactionContext()!);

			const files = (await repository.getFilesRelative(entityManager, 'parent')).sort(sortFunction);

			expect(files).toStrictEqual(
				[
					{ id: 'file0Id', path: '/file0' },
					{ id: 'file1Id', path: '/child1/file1' },
					{ id: 'file2Id', path: '/child2/file2' },
					{ id: 'file3Id', path: '/child1/child3/file3' },
					{ id: 'file4Id', path: '/child1/child4/file4' },
					{ id: 'file5Id', path: '/child2/child5/file5' },
					{ id: 'file6Id', path: '/child2/child6/file6' },
				].sort(sortFunction)
			);
		});
	});

	describe('update', () => {
		it('should update nothing if supplied with empty partial', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('id', 'name', NULL)`)
				.transacting(entityManager.getTransactionContext()!);

			await repository.update(entityManager, 'name', {});

			const selectedDirectory = await entityManager
				.getKnex()
				.raw(`SELECT * FROM ${DIRECTORY_TABLE_NAME} where id = 'id'`)
				.transacting(entityManager.getTransactionContext()!);

			// prettier-ignore
			expect(selectedDirectory[0]).toStrictEqual([{
				id: 'id',
				name: 'name',
				parentId: null,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}]);
		});

		it('should correctly update name and non NULL parentId', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('id', 'name', NULL), ('otherId', 'other', NULL)`)
				.transacting(entityManager.getTransactionContext()!);

			await repository.update(entityManager, 'name', { name: 'testName', parentId: 'otherId' });

			const selectedDirectory = await entityManager
				.getKnex()
				.raw(`SELECT * FROM ${DIRECTORY_TABLE_NAME} where id = 'id'`)
				.transacting(entityManager.getTransactionContext()!);

			// prettier-ignore
			expect(selectedDirectory[0]).toStrictEqual([{
				id: 'id',
				name: 'testName',
				parentId: 'otherId',
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}]);
		});

		it('should correctly update parentId to NULL', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('rootId', 'root', NULL), ('id', 'name', 'rootId')`)
				.transacting(entityManager.getTransactionContext()!);

			await repository.update(entityManager, 'root/name', { name: 'testName', parentId: null });

			const selectedDirectory = await entityManager
				.getKnex()
				.raw(`SELECT * FROM ${DIRECTORY_TABLE_NAME} where id = 'id'`)
				.transacting(entityManager.getTransactionContext()!);

			// prettier-ignore
			expect(selectedDirectory[0]).toStrictEqual([{
				id: 'id',
				name: 'testName',
				parentId: null,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}]);
		});
	});
});
