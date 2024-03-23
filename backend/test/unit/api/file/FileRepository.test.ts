import { EntityManager } from '@mikro-orm/mariadb';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { FileRepository } from 'src/api/file/FileRepository';
import { IFileRepository } from 'src/api/file/IFileRepository';

import config from 'src/config/MikroORMConfig';
import { DIRECTORY_TABLE_NAME } from 'src/db/entities/Directory';
import { FILES_TABLE_NAME } from 'src/db/entities/File';

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
		it('should return "/" if id is NULL', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_FILE_PATH(NULL) as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/');
		});

		it('should return NULL if id does not exist', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_FILE_PATH("test") as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toBeNull();
		});

		it('should return correct path for non recycled first level file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${FILES_TABLE_NAME} (id, name, parentId)
					 VALUES ('rootId', 'root.txt',  null)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_FILE_PATH("rootId") as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/root.txt');
		});

		it('should return correct path for recycled first level file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${FILES_TABLE_NAME} (id, name, parentId, isRecycled)
					 VALUES ('rootId', 'root.txt',  null, true)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_FILE_PATH('rootId') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/root.txt');
		});

		it('should return correct path for nested non recycled file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
                            (id,          name,     parentId)
					 VALUES ('parentId', 'parent',  null),
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

			expect(result![0]?.path).toStrictEqual('/parent/child1/child2/file.txt');
		});

		it('should return correct path for nested recycled directory', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
                            (id,          name,     parentId,  isRecycled)
					 VALUES ('parentId', 'parent',  null,      true),
					        ('child1Id', 'child1', 'parentId', true),
							('child2Id', 'child2', 'child1Id', true);
                            
                     INSERT INTO ${FILES_TABLE_NAME} 
                            (id,        name,       parentId,  isRecycled)
                     VALUES ('fileId', 'file.txt', 'child2Id', true);`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_FILE_PATH('fileId') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toStrictEqual('/parent/child1/child2/file.txt');
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

		it('should return NULL if path is "/"', async () => {
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

		it('should return correct id for non recycled first level file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${FILES_TABLE_NAME} (id, name, parentId) 
				      VALUES ('file1Id', 'test.txt', NULL), 
					         ('file2Id', 'test.txt', NULL)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_FILE_UUID('test') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('file1Id');
		});

		it('should return correct id for recycled first level file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${FILES_TABLE_NAME} (id, name, parentId, isRecycled) 
				      VALUES ('file1Id', 'test', NULL, true), 
					         ('file2Id', 'test', NULL, true)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_FILE_UUID('test') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('file1Id');
		});

		it('should return correct id for non recycled nested file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
                             (id,          name,     parentId ) 
				      VALUES ('parentId', 'parent',  NULL     ), 
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

		it('should return correct id for recycled nested file', async () => {
			await entityManager
				.getKnex()
				.raw(
					`INSERT INTO ${DIRECTORY_TABLE_NAME} 
                             (id,          name,     parentId,  isRecycled) 
				      VALUES ('parentId', 'parent',  NULL     , true), 
					         ('child1Id', 'child1', 'parentId', true),
							 ('child2Id', 'child2', 'child1Id', true);
                             
                     INSERT INTO ${FILES_TABLE_NAME} 
                            (id,        name,       parentId,  isRecycled)
                     VALUES ('fileId', 'file.txt', 'child2Id', true)`
				)
				.transacting(entityManager.getTransactionContext()!);

			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ id: string }>]>(`SELECT GET_FILE_UUID('/parent/child1/child2/file.txt') as id`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.id).toStrictEqual('fileId');
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

		it('should return NULL if path is ""', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME('') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toBeNull();
		});

		it('should return NULL if path is "/"', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ path: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME('/') as path`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.path).toBeNull();
		});

		it('should return correct path if path has no leading slash', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME('parent///dist///') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('///dist///');
		});

		it('should return correct path if path has a single leading slash', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME('/parent///dist') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('///dist');
		});

		it('should return correct path if path has multiple leading slashes', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_PATH_AFTER_UPMOST_DIRNAME('///parent/dist/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('/dist/');
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

		it('should return NULL if path is ""', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME('') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toBeNull();
		});

		it('should return NULL if path is "/"', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME('/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toBeNull();
		});

		it('should return correct dirname if path has no leading slash', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME('parent///dist/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('parent');
		});

		it('should return correct dirname if path has a single leading slash', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME('/parent///dist/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('parent');
		});

		it('should return correct dirname if path has multiple leading slashes', async () => {
			const [result] = await entityManager
				.getKnex()
				.raw<[Array<{ dirname: string }>]>(`SELECT GET_UPMOST_DIRNAME('///parent///dist/') as dirname`)
				.transacting(entityManager.getTransactionContext()!);

			expect(result![0]?.dirname).toStrictEqual('parent');
		});
	});
});
