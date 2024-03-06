import { EntityManager, Transaction } from '@mikro-orm/mariadb';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectoryRepository } from 'src/api/directory/DirectoryRepository';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';

import config from 'src/config/MikroORMConfig';
import { DIRECTORY_TABLE_NAME } from 'src/db/entities/Directory';
import { FILES_TABLE_NAME } from 'src/db/entities/File';
import { PathUtils } from 'src/util/PathUtils';

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

	describe('validate', () => {
		it('should return empty array if no object contains the required keys', async () => {
			const entities = [{ name: 'test', age: '5' }, {}];

			expect(repository['validate'](entities, ['parent'])).toStrictEqual([]);
		});

		it('should return array with all elements if no required keys are given', async () => {
			const entities = [{ name: 'test', age: '5' }, {}];

			expect(repository['validate'](entities, [])).toStrictEqual(entities);
		});

		it('should return array with elements that only contain the required keys', async () => {
			const entities = [{ name: 'test', age: '5' }, { name: 'abc', age: '3', files: 3 }, { name: 'asd' }];
			const expectedEntities = [{ name: 'test' }, { name: 'abc' }, { name: 'asd' }];

			expect(repository['validate'](entities, ['name'])).toStrictEqual(expectedEntities);
		});
	});

	describe('selectByPath', () => {
		it('should return correct name and id if the directory exists and it is not recycled and we are not searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled) VALUES ('testId', 'test', null, false)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath('test'), false)).resolves.toStrictEqual({
				name: 'test',
				id: 'testId',
			});
		});

		it('should return correct name and id if the directory exists and it is recycled and we are searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId, isRecycled) VALUES ('testId', 'test', null, true)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath('test'), true)).resolves.toStrictEqual({
				name: 'test',
				id: 'testId',
			});
		});

		it('should return null if the directory exists but it is recycled and we are not searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId, isRecycled) VALUES ('test', null, true)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath('test'), false)).resolves.toBeNull();
		});

		it('should return null if the directory exists but it is not recycled and we are searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId, isRecycled) VALUES ('test', null, false)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath('test'), true)).resolves.toBeFalsy();
		});

		it('should return null if no directory with that path exists at all', async () => {
			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath('test'), false)).resolves.toBeNull();
			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath('test'), true)).resolves.toBeNull();
			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath('test/abc'), false)).resolves.toBeNull();
			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath('test/abc'), true)).resolves.toBeNull();
			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath('null'), false)).resolves.toBeNull();
			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath('null'), true)).resolves.toBeNull();
			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath(''), false)).resolves.toBeNull();
			await expect(repository.selectByPath(entityManager, PathUtils.normalizeDirectoryPath(''), true)).resolves.toBeNull();
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

			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath('test'), false)).resolves.toBeTruthy();
		});

		it('should return true if the directory exists and it is recycled and we are searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId, isRecycled) VALUES ('test', null, true)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath('test'), true)).resolves.toBeTruthy();
		});

		it('should return false if the directory exists but it is recycled and we are not searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId, isRecycled) VALUES ('test', null, true)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath('test'), false)).resolves.toBeFalsy();
		});

		it('should return false if the directory exists but it is not recycled and we are searching for a recycled one', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId, isRecycled) VALUES ('test', null, false)`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath('test'), true)).resolves.toBeFalsy();
		});

		it('should return false if no directory with that path exists at all', async () => {
			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath(''), true)).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath(''), false)).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath('test'), true)).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath('test'), false)).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath('null'), true)).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath('null'), false)).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath('test/id'), true)).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, PathUtils.normalizeDirectoryPath('test/id'), false)).resolves.toBeFalsy();
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
			const sortFunction = (a: any, b: any) => a.name.localeCompare(b.name);

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
			const sortFunction = (a: any, b: any) => a.name.localeCompare(b.name);

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
			await expect(repository.getMetadata(entityManager, PathUtils.normalizeDirectoryPath('test'))).resolves.toBeNull();
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
			const sortFunction = (a: any, b: any) => a.name.localeCompare(b.name);

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
			const sortFunction = (a: any, b: any) => a.name.localeCompare(b.name);

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
