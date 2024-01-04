// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Pool, createPool } from 'mariadb';
// import { TransactionalConnection } from 'src/db/Connection';
// import { IDatabaseService } from 'src/db/DatabaseService';
// import { MariaDBConnection } from 'src/db/MariaDBConnection';
// import { Environment } from 'src/env.config';

// @Injectable()
// export class MariaDBService implements IDatabaseService {
// 	private readonly logger = new Logger(MariaDBService.name);

// 	private readonly configService: ConfigService;

// 	private readonly pool: Pool;

// 	public constructor(configService: ConfigService) {
// 		this.configService = configService;

// 		this.pool = this.createPool();
// 	}

// 	private createPool(): Pool {
// 		this.logger.log(`Trying to create a new db connection pool...`);

// 		const pool = createPool({
// 			host: this.configService.getOrThrow(Environment.DBHost),
// 			port: this.configService.getOrThrow(Environment.DBPort),
// 			password: this.configService.getOrThrow(Environment.DBPassword),
// 			user: this.configService.getOrThrow(Environment.DBUsername),
// 			database: this.configService.getOrThrow(Environment.DBName),
// 		});

// 		this.logger.log(`Successfully created new db connection pool`);

// 		return pool;
// 	}

// 	public async getConnection(): Promise<TransactionalConnection> {
// 		const poolConnection = await this.pool.getConnection();
// 		return new MariaDBConnection(poolConnection);
// 	}
// }
