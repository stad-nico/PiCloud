import { DataSource, QueryRunner } from 'typeorm';

export async function withTransactionalQueryRunner<T>(dataSource: DataSource, callback: (runner: QueryRunner) => Promise<T>): Promise<T> {
	let queryRunner: QueryRunner = await dataSource.createQueryRunner();

	await queryRunner.connect();
	await queryRunner.startTransaction();

	try {
		let result = await callback(queryRunner);

		await queryRunner.commitTransaction();

		return result;
	} catch (e) {
		await queryRunner.rollbackTransaction();

		throw e;
	} finally {
		await queryRunner.release();
	}
}
