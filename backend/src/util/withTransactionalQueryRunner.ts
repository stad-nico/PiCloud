import { DataSource, QueryRunner } from 'typeorm';

export async function withTransactionalQueryRunner<T>(dataSource: DataSource, callback: (runner: QueryRunner) => Promise<T>): Promise<T> {
	const queryRunner: QueryRunner = dataSource.createQueryRunner();

	await queryRunner.connect();
	await queryRunner.startTransaction();

	try {
		const result = await callback(queryRunner);

		await queryRunner.commitTransaction();

		return result;
	} catch (e) {
		await queryRunner.rollbackTransaction();

		throw e;
	} finally {
		await queryRunner.release();
	}
}
