import { EntityCaseNamingStrategy, MariaDbDriver, defineConfig } from '@mikro-orm/mariadb';
import { Migrator } from '@mikro-orm/migrations';
import { config } from 'dotenv';
import { Environment } from './EnvConfig';

config({ path: `../${process.env.NODE_ENV}.env` });

export default defineConfig({
	driver: MariaDbDriver,
	entities: ['dist/db/entities'],
	entitiesTs: ['src/db/entities'],
	extensions: [Migrator],
	host: process.env[Environment.DBHost]!,
	dbName: process.env[Environment.DBName]!,
	user: process.env[Environment.DBUsername]!,
	password: process.env[Environment.DBPassword]!,
	port: +process.env[Environment.DBPort]!,
	forceUtcTimezone: true,
	namingStrategy: EntityCaseNamingStrategy,
	strict: true,
	multipleStatements: true,
	baseDir: process.cwd(),
	migrations: {
		tableName: 'migrations',
		path: 'dist/db/migrations',
		pathTs: 'src/db/migrations',
		transactional: true,
		snapshot: false,
		emit: 'ts',
	},
});
