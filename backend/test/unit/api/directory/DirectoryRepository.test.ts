import { EntityManager, Transaction } from '@mikro-orm/mariadb';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectoryRepository } from 'src/api/directory/DirectoryRepository';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';

import config from 'src/config/MikroORMConfig';
import { DIRECTORY_TABLE_NAME } from 'src/db/entities/Directory';
import { FILES_TABLE_NAME } from 'src/db/entities/File';
import { PathUtils } from 'src/util/PathUtils';

const sortFunction = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

describe('DirectoryRepository', () => {
	let repository: DirectoryRepository;
	let entityManager: EntityManager;
	let globalTransactionContext: Transaction;
	let currentTransactionContext: Transaction = null;

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

		entityManager = module.get(EntityManager);
		repository = module.get(IDirectoryRepository);

		await entityManager.begin();
		globalTransactionContext = entityManager.getTransactionContext();
	});

	afterAll(async () => {
		await entityManager.getConnection().rollback(globalTransactionContext);
		await entityManager.getConnection().close();
	});

	beforeEach(async () => {
		await entityManager.begin({ ctx: globalTransactionContext });
		currentTransactionContext = entityManager.getTransactionContext();
	});

	afterEach(async () => {
		await entityManager.getConnection().rollback(currentTransactionContext);
	});

	describe('GET_DIRECTORY_PATH', () => {
		it('should return "/" if id is NULL', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH(NULL) as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/');
		});

		it('should return NULL if id does not exist', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH("test") as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toBeNull();
		});

		it('should return correct path for non recycled first level directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId)
					 VALUES ('rootId', 'root',  null)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH("rootId") as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/root/');
		});

		it('should return correct path for recycled first level directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled)
					 VALUES ('rootId', 'root',  null, true)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH("rootId") as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/root/');
		});

		it('should return correct path for nested non recycled directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId)
					 VALUES ('parentId', 'parent',  null),
					        ('child1Id', 'child1', 'parentId'),
							('child2Id', 'child2', 'child1Id')`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH("child2Id") as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/parent/child1/child2/');
		});

		it('should return correct path for nested recycled directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled)
					 VALUES ('parentId', 'parent',  null,      true),
					        ('child1Id', 'child1', 'parentId', true),
							('child2Id', 'child2', 'child1Id', true)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH("child2Id") as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/parent/child1/child2/');
		});
	});

	describe('GET_DIRECTORY_SIZE', () => {
		it('should return zero if directory does not exist', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ size: number }>]>(`SELECT GET_DIRECTORY_SIZE("test") as size`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.size).toStrictEqual(0);
		});

		it('should return zero if passed null as id', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ size: number }>]>(`SELECT GET_DIRECTORY_SIZE(NULL) as size`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.size).toStrictEqual(0);
		});

		it('should return zero if directory has no non recycled files or subdirectories with non recycled files', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled)
					  VALUES ('parentId', 'parent', null,       false),
					         ('child1Id', 'child1', 'parentId', false),
							 ('child2Id', 'child2', 'parentId', true),
							 ('child3Id', 'child3', 'child1Id', false),
							 ('child4Id', 'child4', 'child1Id', true)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ size: number }>]>(`SELECT GET_DIRECTORY_SIZE('parentId') as size`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.size).toStrictEqual(0);
		});

		it('should return correct size excluding recycled files', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled)
					 VALUES ('parentId', 'parent',  null,      false),
					        ('child1Id', 'child1', 'parentId', false),
					        ('child2Id', 'child2', 'parentId', true),
							('child3Id', 'child3', 'child1Id', false),
							('child4Id', 'child4', 'child1Id', true);
					  
					INSERT INTO ${FILES_TABLE_NAME} (name, parentId, isRecycled, size)
					VALUES ('file01', "parentId", false, 12),
						   ('file02', "parentId", true, 19),
						   ('file11', "child1Id", false, 16),
						   ('file12', "child1Id", true, 14),
						   ('file22', "child2Id", true, 13),
						   ('file31', "child3Id", false, 19),
						   ('file32', "child3Id", true, 22),
						   ('file42', "child4Id", true, 9);`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ size: number }>]>(`SELECT GET_DIRECTORY_SIZE('parentId') as size`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.size).toStrictEqual(47);
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

		it('should return NULL if path is "/"', async () => {
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

		it('should return correct id for non recycled first level directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) 
				      VALUES ('test1Id', 'test', NULL), 
					         ('test2Id', 'test', NULL)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID('test') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('test1Id');
		});

		it('should return correct id for recycled first level directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled) 
				      VALUES ('test1Id', 'test', NULL, true), 
					         ('test2Id', 'test', NULL, true)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID("test") as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('test1Id');
		});

		it('should return correct id for non recycled nested directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) 
				      VALUES ('parentId', 'parent',  NULL), 
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

		it('should return correct id for recycled nested directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled) 
				      VALUES ('parentId', 'parent',  NULL,     true), 
					         ('child1Id', 'child1', 'parentId', true),
							 ('child2Id', 'child2', 'child1Id', true)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID('/parent/child1/child2') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('child2Id');
		});
	});

	describe('selectByPath', () => {
		it('should return correct name and id if the directory exists and it is not recycled and we are not searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled) VALUES ('testId', 'test', null, false)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.selectByPath(entityManager, 'test')).resolves.toStrictEqual({
				name: 'test',
				id: 'testId',
			});
		});

		it('should return null if the directory exists but it is recycled and we are not searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId, isRecycled) VALUES ('test', null, true)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.selectByPath(entityManager, 'test')).resolves.toBeNull();
		});

		it('should return null if no directory with that path exists at all', async () => {
			await expect(repository.selectByPath(entityManager, null as any)).resolves.toBeNull();
			await expect(repository.selectByPath(entityManager, '')).resolves.toBeNull();
			await expect(repository.selectByPath(entityManager, 'test')).resolves.toBeNull();
		});
	});

	describe('selectById', () => {
		it('should return correct path if directory is a first-level directory', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ("testId", 'test', null)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.selectById(entityManager, 'testId')).resolves.toStrictEqual({
				path: PathUtils.normalizeDirectoryPath('test'),
				isRecycled: false,
			});
		});

		it('should return correct path if directory is a nested directory', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', null)`)
				.transacting(entityManager.getTransactionContext()!);

			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('testId', 'test', 'parentId')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.selectById(entityManager, 'testId')).resolves.toStrictEqual({
				path: PathUtils.normalizeDirectoryPath('parent/test'),
				isRecycled: false,
			});
		});

		it('should return null if no directory with that id exists at all', async () => {
			await expect(repository.selectById(entityManager, 'uuid3h4v')).resolves.toBeNull();
			await expect(repository.selectById(entityManager, 'null')).resolves.toBeNull();
			await expect(repository.selectById(entityManager, '')).resolves.toBeNull();
		});
	});

	describe('exists', () => {
		it('should return true if the directory exists and it is not recycled and we are not searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId, isRecycled) VALUES ('test', null, false)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.exists(entityManager, 'test')).resolves.toBeTruthy();
		});

		it('should return false if the directory exists but it is recycled and we are not searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId, isRecycled) VALUES ('test', null, true)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.exists(entityManager, 'test')).resolves.toBeFalsy();
		});

		it('should return false if no directory with that path exists at all', async () => {
			await expect(repository.exists(entityManager, null as any)).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, '')).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, 'test')).resolves.toBeFalsy();
		});
	});

	describe('insert', () => {
		it('should insert an entity with parentId=NULL, name, isRecycled=0, auto generated id, updatedAt and generatedAt', async () => {
			await expect(repository.insert(entityManager, 'testName', null)).resolves.not.toThrow();

			const [entities] = await entityManager.getKnex().raw(`SELECT * FROM ${DIRECTORY_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(entities).toStrictEqual([
				{
					name: 'testName',
					parentId: null,
					id: expect.any(String),
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
					isRecycled: 0,
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
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', null)`)
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
					isRecycled: 0,
				},
			]);
		});
	});

	describe('softDelete', () => {
		it('should update nothing if directory does not exist', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId)
					  VALUES ('parentId',                'parent',                 null),
					         ('firstLevelChildId',       'firstLevelChild',       'parentId'),
							 ('secondLevelChildId',      'secondLevelChild',      'firstLevelChildId');`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.softDelete(entityManager, 'otherParentId')).resolves.not.toThrow();

			const [entities] = await entityManager
				.getKnex()
				.raw(`SELECT name FROM ${DIRECTORY_TABLE_NAME} where isRecycled = true`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities).toStrictEqual([]);
		});

		it('should update all files inside the directory and subdirectories as recycled', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId)
					VALUES ('parentId',                'parent',                 null),
					         ('firstLevelChildId',       'firstLevelChild',       'parentId'),
							 ('secondLevelChildId',      'secondLevelChild',      'firstLevelChildId'),
							 ('otherParentId',           'otherParent',            null),
					         ('otherFirstLevelChildId',  'otherFirstLevelChild',  'otherParentId'),
							 ('otherSecondLevelChildId', 'otherSecondLevelChild', 'otherFirstLevelChildId');
							 
					INSERT INTO ${FILES_TABLE_NAME} (name, parentId)
					VALUES ('A.txt', 'parentId'),
						   ('B.txt', 'firstLevelChildId'),
						   ('C.txt', 'secondLevelChildId'),
						   ('A2.txt', 'otherParentId'),
						   ('B2.txt', 'otherFirstLevelChildId'),
						   ('C2.txt', 'otherSecondLevelChildId');`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.softDelete(entityManager, 'parentId')).resolves.not.toThrow();

			const [entities] = await entityManager
				.getKnex()
				.raw(`SELECT name FROM ${FILES_TABLE_NAME} where isRecycled = true`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities.sort(sortFunction)).toStrictEqual([{ name: 'A.txt' }, { name: 'B.txt' }, { name: 'C.txt' }].sort(sortFunction));
		});

		it('should update directory and all subdirectories as recycled', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId)
					  VALUES ('parentId',                'parent',                 null),
					         ('firstLevelChildId',       'firstLevelChild',       'parentId'),
							 ('secondLevelChildId',      'secondLevelChild',      'firstLevelChildId'),
							 ('otherParentId',           'otherParent',            null),
					         ('otherFirstLevelChildId',  'otherFirstLevelChild',  'otherParentId'),
							 ('otherSecondLevelChildId', 'otherSecondLevelChild', 'otherFirstLevelChildId')`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.softDelete(entityManager, 'parentId')).resolves.not.toThrow();

			const [entities] = await entityManager
				.getKnex()
				.raw(`SELECT name FROM ${DIRECTORY_TABLE_NAME} where isRecycled = true`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities.sort(sortFunction)).toStrictEqual(
				[{ name: 'parent' }, { name: 'firstLevelChild' }, { name: 'secondLevelChild' }].sort(sortFunction)
			);
		});
	});

	describe('getMetadata', () => {
		it('should return null if directory does not exist', async () => {
			await expect(repository.getMetadata(entityManager, 'test')).resolves.toBeNull();
		});

		it('should return null if directory exists, but it is recycled', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled) VALUES ('parentId', 'parent', null, true)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.getMetadata(entityManager, 'test')).resolves.toBeNull();
		});

		it('should return metadata with size zero, no files and no directories', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', null)`)
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

		it('should return metadata with correct size, files and directories excluding recycled ones', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled)
					 VALUES ('parentId', 'parent',  null,      false),
					        ('child1Id', 'child1', 'parentId', false),
					        ('child2Id', 'child2', 'parentId', true),
							('child3Id', 'child3', 'child1Id', false),
							('child4Id', 'child4', 'child1Id', true);
					  
					INSERT INTO ${FILES_TABLE_NAME} (name, parentId, isRecycled, size)
					VALUES ('file01', "parentId", false, 12),
						   ('file02', "parentId", true, 19),
						   ('file11', "child1Id", false, 16),
						   ('file12', "child1Id", true, 14),
						   ('file22', "child2Id", true, 13),
						   ('file31', "child3Id", false, 19),
						   ('file32', "child3Id", true, 22),
						   ('file42', "child4Id", true, 9);`
				)
				.transacting(entityManager.getTransactionContext()!);

			const metadata = await repository.getMetadata(entityManager, 'parent');

			expect(metadata).toStrictEqual({
				id: 'parentId',
				name: 'parent',
				size: 47,
				directories: 2,
				files: 3,
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
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId) VALUES ("test", null)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.getContent(entityManager, 'test')).resolves.toStrictEqual({
				files: [],
				directories: [],
			});
		});

		it('should return correct files and directories excluding recycled ones', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled)
					 VALUES ('parentId', 'parent',  null,      false),
					        ('child1Id', 'child1', 'parentId', false),
					        ('child2Id', 'child2', 'parentId', true);
					  
					INSERT INTO ${FILES_TABLE_NAME} (id, name, parentId, mimeType, isRecycled, size)
					VALUES ('file01Id', 'file01', 'parentId', 'text/plain', false, 12),
						   ('file02Id', 'file02', 'parentId', 'text/plain', true,  19),
						   ('file11Id', 'file11', 'child1Id', 'text/plain', false, 11),
						   ('file12Id', 'file12', 'child1Id', 'text/plain', true,  14),
						   ('file21Id', 'file21', 'child2Id', 'text/plain', true,  9);`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.getContent(entityManager, 'parent')).resolves.toStrictEqual({
				files: [{ id: 'file01Id', name: 'file01', size: 12, mimeType: 'text/plain', createdAt: expect.any(Date), updatedAt: expect.any(Date) }],
				directories: [{ id: 'child1Id', name: 'child1', size: 11, createdAt: expect.any(Date), updatedAt: expect.any(Date) }],
			});
		});
	});

	describe('getFilesRelative', () => {
		it('should return empty array if directory does not exist', async () => {
			await expect(repository.getFilesRelative(entityManager, 'test')).resolves.toStrictEqual([]);
		});

		it('should return empty array if directory does not contain any files', async () => {
			await entityManager.getKnex().raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name) VALUES ("test")`).transacting(entityManager.getTransactionContext()!);

			await expect(repository.getFilesRelative(entityManager, 'test')).resolves.toStrictEqual([]);
		});

		it('should return array of files with correct path and id excluding recycled ones', async () => {
			const sortFunction = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);

			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled)
					 VALUES ('parentId', 'parent',  null,      false),
					        ('child1Id', 'child1', 'parentId', false),
					        ('child2Id', 'child2', 'parentId', true),
							('child3Id', 'child3', 'child1Id', false),
							('child4Id', 'child4', 'child1Id', true);
					  
					INSERT INTO ${FILES_TABLE_NAME} (id, name, parentId, isRecycled, size)
					VALUES ('file01Id', 'file01', "parentId", false, 12),
						   ('file02Id', 'file02', "parentId", true, 19),
						   ('file11Id', 'file11', "child1Id", false, 16),
						   ('file12Id', 'file12', "child1Id", true, 14),
						   ('file22Id', 'file22', "child2Id", true, 13),
						   ('file31Id', 'file31', "child3Id", false, 19),
						   ('file32Id', 'file32', "child3Id", true, 22),
						   ('file42Id', 'file42', "child4Id", true, 9);`
				)
				.transacting(entityManager.getTransactionContext()!);

			const files = (await repository.getFilesRelative(entityManager, 'parent')).sort(sortFunction);

			expect(files).toStrictEqual(
				[
					{ id: 'file01Id', path: PathUtils.normalizeFilePath('file01') },
					{ id: 'file11Id', path: PathUtils.normalizeFilePath('child1/file11') },
					{ id: 'file31Id', path: PathUtils.normalizeFilePath('child1/child3/file31') },
				].sort(sortFunction)
			);
		});
	});

	describe('update', () => {
		it('should update nothing if supplied with empty partial', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('id', 'name', null)`)
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
				isRecycled: 0,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}]);
		});

		it('should correctly update name and non null parentId', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('id', 'name', null), ('otherId', 'other', null)`)
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
				parentId: "otherId",
				isRecycled: 0,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}]);
		});

		it('should correctly update parentId to null', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('rootId', 'root', null), ('id', 'name', 'rootId')`)
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
				isRecycled: 0,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}]);
		});
	});

	describe('restore', () => {
		it('should update nothing if directory does not exist', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled)
					  VALUES ('parentId',                'parent',                 null,               true),
					         ('firstLevelChildId',       'firstLevelChild',       'parentId',          true),
							 ('secondLevelChildId',      'secondLevelChild',      'firstLevelChildId', true);`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.restore(entityManager, 'otherParentId')).resolves.not.toThrow();

			const [entities] = await entityManager
				.getKnex()
				.raw(`SELECT name FROM ${DIRECTORY_TABLE_NAME} where isRecycled = false`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities).toStrictEqual([]);
		});

		it('should update all files inside the directory and subdirectories as not recycled', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled)
					VALUES ('parentId',                'parent',                 null,                    true),
					       ('firstLevelChildId',       'firstLevelChild',       'parentId',               true),
						   ('secondLevelChildId',      'secondLevelChild',      'firstLevelChildId',      true),
						   ('otherParentId',           'otherParent',            null,                    true),
					       ('otherFirstLevelChildId',  'otherFirstLevelChild',  'otherParentId',          true),
						   ('otherSecondLevelChildId', 'otherSecondLevelChild', 'otherFirstLevelChildId', true);
							 
					INSERT INTO ${FILES_TABLE_NAME} (name, parentId, isRecycled)
					VALUES ('A.txt',  'parentId',                 true),
						   ('B.txt',  'firstLevelChildId',        true),
						   ('C.txt',  'secondLevelChildId',       true),
						   ('A2.txt', 'otherParentId',            true),
						   ('B2.txt', 'otherFirstLevelChildId',   true),
						   ('C2.txt', 'otherSecondLevelChildId',  true);`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.restore(entityManager, 'parentId')).resolves.not.toThrow();

			const [entities] = await entityManager
				.getKnex()
				.raw(`SELECT name FROM ${FILES_TABLE_NAME} where isRecycled = false`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities.sort(sortFunction)).toStrictEqual([{ name: 'A.txt' }, { name: 'B.txt' }, { name: 'C.txt' }].sort(sortFunction));
		});

		it('should update directory and all subdirectories as not recycled', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled)
					  VALUES ('parentId',                'parent',                 null,                    true),
					         ('firstLevelChildId',       'firstLevelChild',       'parentId',               true),
							 ('secondLevelChildId',      'secondLevelChild',      'firstLevelChildId',      true),
							 ('otherParentId',           'otherParent',            null,                    true),
					         ('otherFirstLevelChildId',  'otherFirstLevelChild',  'otherParentId',          true),
							 ('otherSecondLevelChildId', 'otherSecondLevelChild', 'otherFirstLevelChildId', true)`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.restore(entityManager, 'parentId')).resolves.not.toThrow();

			const [entities] = await entityManager
				.getKnex()
				.raw(`SELECT name FROM ${DIRECTORY_TABLE_NAME} where isRecycled = false`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities.sort(sortFunction)).toStrictEqual(
				[{ name: 'parent' }, { name: 'firstLevelChild' }, { name: 'secondLevelChild' }].sort(sortFunction)
			);
		});
	});
});
