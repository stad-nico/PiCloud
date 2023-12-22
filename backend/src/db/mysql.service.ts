import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PoolConnection, QueryOptions, createPool } from 'mysql2/promise';
import { Pool } from 'mysql2/typings/mysql/lib/Pool';
import { IDatabaseService } from 'src/db/DatabaseService';
import { Environment } from 'src/env.config';

@Injectable()
export class MySqlService implements IDatabaseService {
	private readonly logger = new Logger(MySqlService.name);

	private readonly configService: ConfigService;

	private static pool: Pool;

	private connection: PoolConnection | undefined;

	public constructor(configService: ConfigService) {
		this.configService = configService;
	}

	public async init(): Promise<Pool> {
		this.logger.log('Trying to connect to database...');

		let retries = this.configService.get(Environment.DBConnectionRetries) ?? 4;
		let lastError;

		while (retries-- > 1) {
			try {
				const pool = await this.connect();
				console.log(pool);

				if (!pool) {
					throw new Error('NOP');
				}

				this.logger.log('Successfully connected to database');
				MySqlService.pool = pool;
				console.log(this);
				return pool as any;
			} catch (e) {
				lastError = e;
				this.logger.error(`Attempt failed, retrying... (${retries} retries left)`);
			}
		}

		throw new Error(`Could not connect to the database: ${lastError}`);
	}

	private connect(): Pool {
		return createPool({
			host: this.configService.getOrThrow(Environment.DBHost),
			port: this.configService.getOrThrow(Environment.DBPort),
			password: this.configService.getOrThrow(Environment.DBPassword),
			user: this.configService.getOrThrow(Environment.DBUsername),
			database: this.configService.getOrThrow(Environment.DBName),
		}).pool;
	}

	public async executePreparedStatement<T>(query: string, params: unknown): Promise<Partial<T>> {
		let result: [Partial<T>];
		const options: QueryOptions = {
			sql: query,
			values: params,
			namedPlaceholders: true,
		};

		if (this.connection) {
			result = (await this.connection.execute(options))[0] as unknown as [Partial<T>];
		} else {
			result = (await MySqlService.pool.promise().execute(options))[0] as unknown as [Partial<T>];
		}

		return result[0];
	}

	public async startTransaction(): Promise<void> {
		const connection = await MySqlService.pool.promise().getConnection();
		connection.config.namedPlaceholders = true;

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
}
