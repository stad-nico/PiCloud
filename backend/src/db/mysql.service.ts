import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, createPool } from 'mysql2/promise';
import { Environment } from 'src/env.config';

@Injectable()
export class MySqlService {
	private readonly logger = new Logger(MySqlService.name);

	private readonly configService: ConfigService;

	private connection: Pool | undefined;

	public constructor(configService: ConfigService) {
		this.configService = configService;
	}

	public async query(query: string, params: unknown): Promise<unknown> {
		if (!this.connection) {
			await this.init();
		}

		return await this.connection!.execute(query, params);
	}

	public async init(): Promise<void> {
		this.logger.log('Trying to connect to database...');

		let retries = this.configService.getOrThrow(Environment.DBConnectionRetries);
		let lastError;

		while (retries-- > 0) {
			try {
				this.connection = await this.connect();

				this.logger.log('Successfully connected to database');

				return;
			} catch (e) {
				lastError = e;
				this.logger.error(`Attempt failed, retrying...`);
			}
		}

		throw new Error(`Could not connect to the database: ${lastError}`);
	}

	private async connect(): Promise<Pool> {
		return await createPool({
			host: this.configService.getOrThrow(Environment.DBHost),
			port: this.configService.getOrThrow(Environment.DBPort),
			password: this.configService.getOrThrow(Environment.DBPassword),
			user: this.configService.getOrThrow(Environment.DBUsername),
			database: this.configService.getOrThrow(Environment.DBName),
		});
	}
}
