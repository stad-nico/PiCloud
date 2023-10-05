import { withTransactionalQueryRunner } from 'src/util/withTransactionalQueryRunner';
import { mockedDataSource } from 'test/mock/mockedDataSource.spec';
import { mockedQueryRunner } from 'test/mock/mockedQueryRunner.spec';
import { DataSource } from 'typeorm';

jest.mock('typeorm', () => ({
	DataSource: jest.fn().mockImplementation(() => mockedDataSource),
}));

describe('withTransactionalQueryRunner', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should catch the error, rollback the transaction, release the runner and rethrow the error', async () => {
		await expect(
			withTransactionalQueryRunner(new DataSource({ type: 'mariadb' }), (runner) => {
				throw new Error('test');
			})
		).rejects.toThrowError('test');

		await expect(mockedDataSource.createQueryRunner).toBeCalled();
		await expect(mockedQueryRunner.connect).toBeCalled();
		await expect(mockedQueryRunner.startTransaction).toBeCalled();
		await expect(mockedQueryRunner.rollbackTransaction).toBeCalled();
		await expect(mockedQueryRunner.commitTransaction).not.toBeCalled();
		await expect(mockedQueryRunner.release).toBeCalled();
	});

	it('should execute the function without an error, commit the transaction, release the runner and return the value', async () => {
		let result = await withTransactionalQueryRunner(new DataSource({ type: 'mariadb' }), async (runner) => {
			return 5;
		});

		expect(result).toBe(5);
		await expect(mockedDataSource.createQueryRunner).toBeCalled();
		await expect(mockedQueryRunner.connect).toBeCalled();
		await expect(mockedQueryRunner.startTransaction).toBeCalled();
		await expect(mockedQueryRunner.rollbackTransaction).not.toBeCalled();
		await expect(mockedQueryRunner.commitTransaction).toBeCalled();
		await expect(mockedQueryRunner.release).toBeCalled();
	});
});
