import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Environment } from '../env.config';

function env(env: Environment, p: ConfigService | NodeJS.ProcessEnv) {
	if (p instanceof ConfigService) {
		return p.getOrThrow(env);
	}
	console.log(env, p[env]);
	return p[env] || 'ddd';
}

export function databaseConfig(p: ConfigService | NodeJS.ProcessEnv = process.env): DataSourceOptions {
	return {
		type: 'mariadb',
		host: env(Environment.DBHost, p),
		port: env(Environment.DBPort, p),
		username: env(Environment.DBUsername, p),
		password: env(Environment.DBPassword, p),
		database: env(Environment.DBName, p),
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
