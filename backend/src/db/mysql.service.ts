import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolConnection, createPool } from 'mysql2/promise';
import { IDatabaseService } from 'src/db/DatabaseService';
import { Environment } from 'src/env.config';

@Injectable()
export class MySqlService implements IDatabaseService {
	private readonly logger = new Logger(MySqlService.name);

	private readonly configService: ConfigService;

	private pool: Pool;

	private connection: PoolConnection | undefined;

	public constructor(configService: ConfigService) {
		this.configService = configService;

		this.pool = this.connect();
	}

	private connect(): Pool {
		return createPool({
			host: this.configService.getOrThrow(Environment.DBHost),
			port: this.configService.getOrThrow(Environment.DBPort),
			password: this.configService.getOrThrow(Environment.DBPassword),
			user: this.configService.getOrThrow(Environment.DBUsername),
			database: this.configService.getOrThrow(Environment.DBName),
		});
	}

	public async executePreparedStatement(query: string, params: unknown): Promise<unknown> {
		if (this.connection) {
			return this.connection.execute(query, params);
		}

		return await this.pool.execute(query, params);
	}

	public async startTransaction(): Promise<void> {
		const connection = await this.pool.getConnection();
		connection.beginTransaction();

		this.connection = connection;
	}

	public async commitTransaction(): Promise<void> {
		if (!this.connection) {
			return;
		}

		await this.connection.commit();

		this.connection.release();
	}

	public async rollbackTransaction(): Promise<void> {
		if (!this.connection) {
			return;
		}

		await this.connection.rollback();

		this.connection.release();
	}

	public async init(): Promise<void> {
		this.logger.log('Trying to connect to database...');

		let retries = this.configService.getOrThrow(Environment.DBConnectionRetries);
		let lastError;

		while (retries-- > 0) {
			try {
				this.pool = this.connect();

				this.logger.log('Successfully connected to database');

				return;
			} catch (e) {
				lastError = e;
				this.logger.error(`Attempt failed, retrying...`);
			}
		}

		throw new Error(`Could not connect to the database: ${lastError}`);
	}
}
