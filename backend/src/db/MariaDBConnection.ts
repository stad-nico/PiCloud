import { PoolConnection } from 'mariadb';
import { TransactionalConnection } from 'src/db/Connection';
import { QueryBundle } from 'src/db/queries/File';

export class MariaDBConnection implements TransactionalConnection {
	private readonly connection: PoolConnection;

	public constructor(connection: PoolConnection) {
		this.connection = connection;
	}

	async executePreparedStatement(queryBundle: QueryBundle): Promise<any> {
		return await this.connection.execute(queryBundle.query, queryBundle.params);
	}

	async release(): Promise<void> {
		await this.connection.release();
	}

	async startTransaction(): Promise<void> {
		await this.connection.beginTransaction();
	}

	async commitTransaction(): Promise<void> {
		await this.connection.commit();
	}

	async rollbackTransaction(): Promise<void> {
		await this.connection.rollback();
	}
}
