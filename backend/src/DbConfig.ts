import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EnvVariables, Environment, validate } from './EnvConfig';

export function databaseConfig(p: ConfigService | NodeJS.ProcessEnv = process.env): DataSourceOptions {
	const { parsed } = dotenv.config({ path: `../${(process.env.NODE_ENV ?? 'dev').trim()}.env` });

	const env: EnvVariables = validate(parsed!);

	return {
		type: 'mariadb',
		host: env[Environment.DBHost],
		port: env[Environment.DBPort],
		username: env[Environment.DBUsername],
		password: env[Environment.DBPassword],
		database: env[Environment.DBName],
		synchronize: true,
		entities: ['dist/db/entities/*.js'],
		migrations: ['dist/db/migrations/*.js'],
		migrationsTransactionMode: 'each',
		dateStrings: true,
		supportBigNumbers: true,
		bigNumberStrings: false,
	};
}

const dataSource = new DataSource(databaseConfig());
export default dataSource;
