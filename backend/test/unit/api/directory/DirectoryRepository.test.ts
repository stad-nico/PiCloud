import { EntityManager, Transaction } from '@mikro-orm/mariadb';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectoryRepository } from 'src/api/directory/DirectoryRepository';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';

import config from 'src/config/MikroORMConfig';

describe('DirectoryRepository', () => {
	let repository: DirectoryRepository;
	let globalEntityManager: EntityManager;
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

		globalEntityManager = module.get(EntityManager);
		repository = module.get(IDirectoryRepository);

		await globalEntityManager.begin();
		globalTransactionContext = globalEntityManager.getTransactionContext();
	});

	afterAll(async () => {
		await globalEntityManager.getConnection().commit(globalTransactionContext);
	});

	beforeEach(async () => {
		await globalEntityManager.begin({ ctx: globalTransactionContext });
		currentTransactionContext = globalEntityManager.getTransactionContext();
	});

	afterEach(async () => {
		await globalEntityManager.getConnection().rollback(currentTransactionContext);
	});

	describe('validate', () => {
		it('should return empty array if no object contains the required keys', async () => {
			const entities = [{ name: 'name', age: '5' }, {}];

			expect(repository['validate'](entities, ['parent'])).toStrictEqual([]);
		});

		it('should return array with all elements if no required keys are given', async () => {
			const entities = [{ name: 'name', age: '5' }, {}];

			expect(repository['validate'](entities, [])).toStrictEqual(entities);
		});

		it('should return array with elements that only contain the required keys', async () => {
			const entities = [{ name: 'name', age: '5' }, { name: 'abc', age: '3', files: 3 }, { name: 'asd' }];
			const expectedEntities = [{ name: 'name' }, { name: 'abc' }, { name: 'asd' }];

			expect(repository['validate'](entities, ['name'])).toStrictEqual(expectedEntities);
		});
	});
});
