import { Connection } from 'src/db/Connection';
import { IDatabaseService } from 'src/db/DatabaseService';

export interface IRepository {
	transactional<T>(callback: (connection: Connection) => Promise<T>): Promise<T>;
}

export abstract class Repository implements IRepository {
	private readonly databaseService: IDatabaseService;

	protected constructor(databaseService: IDatabaseService) {
		this.databaseService = databaseService;
	}

	public async transactional<T>(callback: (connection: Connection) => Promise<T>): Promise<T> {
		const connection = await this.databaseService.getConnection();

		await connection.startTransaction();

		try {
			const result = await callback(connection);

			await connection.commitTransaction();

			return result;
		} catch (e) {
			await connection.rollbackTransaction();

			throw e;
		} finally {
			connection.release();
		}
	}
}
