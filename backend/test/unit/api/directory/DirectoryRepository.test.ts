import { EntityManager } from '@mikro-orm/mariadb';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';

import { DirectoryRepository } from 'src/api/directory/DirectoryRepository';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import config from 'src/config/MikroORMConfig';
import { DIRECTORY_TABLE_NAME, Directory } from 'src/db/entities/Directory';
import { FILES_TABLE_NAME } from 'src/db/entities/File';
import { TREE_TABLE_NAME } from 'src/db/entities/Tree';

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

			expect(result![0]?.path).toStrictEqual('root');
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
					 VALUES ('testId', 'test',  'root'    )`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH('testId') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/root/test/');
		});

		it('should return correct path for nested  directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
					        (id,          name,     parentId )
					 VALUES ('parentId', 'parent', 'root'    ),
					        ('child1Id', 'child1', 'parentId'),
							('child2Id', 'child2', 'child1Id')`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_DIRECTORY_PATH('child2Id') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/root/parent/child1/child2/');
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
					  VALUES ('parentId', 'parent', 'root'    ),
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
					 VALUES ('parentId', 'parent', 'root'    ),
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

		it(`should return 'root' if path is '/'`, async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID('/') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('root');
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
				     VALUES ('test1Id', 'test1', 'root'   )`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID('/root/test1') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('test1Id');
		});

		it('should return correct id for nested directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
						     (id,          name,     parentId ) 
				      VALUES ('parentId', 'parent', 'root'    ), 
					         ('child1Id', 'child1', 'parentId'),
							 ('child2Id', 'child2', 'child1Id')`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_DIRECTORY_UUID('/root/parent/child1/child2') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('child2Id');
		});
	});

	describe('insert', () => {
		it('should insert the entity with root as parent', async () => {
			await expect(repository.insert(entityManager, 'testName', 'root')).resolves.not.toThrow();

			const [entities] = await entityManager
				.getKnex()
				.raw<[Directory[]]>(`SELECT * FROM ${DIRECTORY_TABLE_NAME}`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities!.filter((x) => x.id !== 'root')).toStrictEqual([
				{
					name: 'testName',
					parentId: 'root',
					id: expect.any(String),
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);
		});

		it('should insert the entity if the parent is represented in the db', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.insert(entityManager, 'testName', 'parentId')).resolves.not.toThrow();

			const [inserted] = await entityManager
				.getKnex()
				.raw<[Directory[]]>(`SELECT * FROM ${DIRECTORY_TABLE_NAME} WHERE name='testName'`)
				.transacting(entityManager.getTransactionContext()!);

			expect(inserted!.filter((x) => x.id !== 'root')).toStrictEqual([
				{
					name: 'testName',
					parentId: 'parentId',
					id: expect.any(String),
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);
		});

		it('should throw an error if parent does not exist', async () => {
			await expect(repository.insert(entityManager, 'testName', 'jklfs23')).rejects.toThrow();

			const [entities] = await entityManager
				.getKnex()
				.raw<[Directory[]]>(`SELECT * FROM ${DIRECTORY_TABLE_NAME}`)
				.transacting(entityManager.getTransactionContext()!);

			expect(entities!.filter((x) => x.id !== 'root')).toStrictEqual([]);
		});

		it('should insert two entities with same name but different parent and not throw', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.insert(entityManager, 'test', 'parentId')).resolves.not.toThrow();
			await expect(repository.insert(entityManager, 'test', 'root')).resolves.not.toThrow();
		});

		it('should throw an error if entity already exists', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.insert(entityManager, 'parent', 'root')).rejects.toThrow();
		});
	});

	describe('exists', () => {
		it('should return true for the root directory by default', async () => {
			await expect(repository.exists(entityManager, '')).resolves.toBeTruthy();
			await expect(repository.exists(entityManager, '/')).resolves.toBeTruthy();
		});

		it('should return false if no directory with that path exists', async () => {
			await expect(repository.exists(entityManager, null as any)).resolves.toBeFalsy();
			await expect(repository.exists(entityManager, 'test')).resolves.toBeFalsy();
		});

		it('should return true if the directory exists (first level)', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId) VALUES ('test', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.exists(entityManager, 'root/test')).resolves.toBeTruthy();
		});

		it('should return true if the directory exists (nested)', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
				            (id,          name,     parentId) 
					 VALUES ('parentId', 'parent', 'root'),
					        ('nestedId', 'nested', 'parentId')`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.exists(entityManager, 'root/parent/nested')).resolves.toBeTruthy();
		});
	});

	describe('select', () => {
		it('should return true for the root directory by default', async () => {
			const entity = { id: 'root', name: 'root' };

			await expect(repository.select(entityManager, '')).resolves.toStrictEqual(entity);
			await expect(repository.select(entityManager, '/')).resolves.toStrictEqual(entity);
		});

		it('should return NULL if no directory with that path exists', async () => {
			await expect(repository.select(entityManager, null as any)).resolves.toBeNull();
			await expect(repository.select(entityManager, 'test')).resolves.toBeNull();
		});

		it('should return the correct name and id of a first level directory', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('testId', 'test', 'root');`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.select(entityManager, 'root/test')).resolves.toStrictEqual({
				name: 'test',
				id: 'testId',
			});
		});

		it('should return the correct name and id of a nested directory', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('testId', 'test', 'root'), ('dir', 'dir', 'testId');`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.select(entityManager, 'root/test/dir')).resolves.toStrictEqual({
				name: 'dir',
				id: 'dir',
			});
		});
	});

	describe('getMetadata', () => {
		it('should return null if directory does not exist', async () => {
			await expect(repository.getMetadata(entityManager, 'test')).resolves.toBeNull();
		});

		it('should return metadata with size zero, no files and no directories', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('parentId', 'parent', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			const metadata = await repository.getMetadata(entityManager, 'root/parent');

			expect(metadata).toStrictEqual({
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
					 VALUES ('parentId', 'parent', 'root'    ),
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

			const metadata = await repository.getMetadata(entityManager, 'root/parent');

			expect(metadata).toStrictEqual({
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
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (name, parentId) VALUES ('test', 'root')`)
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
					 VALUES ('parentId', 'parent', 'root'    ),
					        ('child1Id', 'child1', 'parentId'),
					        ('child2Id', 'child2', 'parentId');
					  
					INSERT INTO ${FILES_TABLE_NAME} 
						   (id,          name,   parentId,   mimeType,    size)
					VALUES ('file0Id', 'file0', 'parentId', 'text/plain', 11),
						   ('file1Id', 'file1', 'child1Id', 'text/csv', 12),
						   ('file2Id', 'file2', 'child2Id', 'application/json', 13);`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.getContent(entityManager, 'root/parent')).resolves.toStrictEqual({
				files: [{ name: 'file0', size: 11, mimeType: 'text/plain', createdAt: expect.any(String), updatedAt: expect.any(String) }],
				directories: [
					{ name: 'child1', size: 12, createdAt: expect.any(String), updatedAt: expect.any(String) },
					{ name: 'child2', size: 13, createdAt: expect.any(String), updatedAt: expect.any(String) },
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
					 VALUES ('parentId', 'parent', 'root'     ),
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

			const files = (await repository.getFilesRelative(entityManager, 'root/parent')).sort(sortFunction);

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
			const spy = jest.spyOn(entityManager, 'getKnex');

			await repository.update(entityManager, 'path', {});

			expect(spy).not.toHaveBeenCalled();
		});

		it('should throw if parentId does not exist', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('id', 'parent', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.update(entityManager, 'root/parent', { parentId: 'nonexisting' })).rejects.toThrow();
		});

		it('should correctly update name and non NULL parentId', async () => {
			await entityManager
				.getKnex()
				.raw(`INSERT INTO ${DIRECTORY_TABLE_NAME} (id, name, parentId) VALUES ('id', 'name', 'root'), ('otherId', 'other', 'root')`)
				.transacting(entityManager.getTransactionContext()!);

			await repository.update(entityManager, 'root/name', { name: 'testName', parentId: 'otherId' });

			const [selectedDirectory] = await entityManager
				.getKnex()
				.raw(`SELECT * FROM ${DIRECTORY_TABLE_NAME} where id = 'id'`)
				.transacting(entityManager.getTransactionContext()!);

			// prettier-ignore
			expect(selectedDirectory).toStrictEqual([{
				id: 'id',
				name: 'testName',
				parentId: 'otherId',
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}]);
		});
	});

	describe('delete', () => {
		it('should delete directory with all subdirectories and files from directories, files and tree tables', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
						    (id,          name,     parentId) 
					 VALUES ('parentId', 'parent', 'root'),
					        ('child1Id', 'child1', 'parentId'),
						    ('child2Id', 'child2', 'child1Id');
							
					 INSERT INTO ${FILES_TABLE_NAME}
					        (id,         name,    parentId)
					 VALUES ('file1Id', 'file1', 'parentId'),
					  		('file2Id', 'file2', 'child1Id'),
					  		('file3Id', 'file3', 'child2Id');`
				)
				.transacting(entityManager.getTransactionContext()!);

			await expect(repository.delete(entityManager, 'parentId')).resolves.not.toThrow();

			const [files] = await entityManager.getKnex().raw(`SELECT * FROM ${FILES_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(files).toStrictEqual([]);

			const [directories] = await entityManager
				.getKnex()
				.raw(`SELECT * FROM ${DIRECTORY_TABLE_NAME}`)
				.transacting(entityManager.getTransactionContext()!);

			expect(directories).toStrictEqual([
				{
					id: 'root',
					name: 'root',
					parentId: null,
					createdAt: expect.any(String),
					updatedAt: expect.any(String),
				},
			]);

			const [tree] = await entityManager.getKnex().raw(`SELECT * FROM ${TREE_TABLE_NAME}`).transacting(entityManager.getTransactionContext()!);

			expect(tree).toStrictEqual([
				{
					id: expect.any(Number),
					childId: 'root',
					parentId: 'root',
					depth: 0,
				},
			]);
		});
	});
});
