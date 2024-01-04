import { DataSource, DataSourceOptions } from 'typeorm';

export const databaseConfig: DataSourceOptions = {
	// TypeORM PostgreSQL DB Drivers
	type: 'mariadb',
	host: 'localhost',
	port: 3306,
	username: 'root',
	password: 'mariadbdev',
	// Database name
	database: 'test',
	// Synchronize database schema with entities
	synchronize: false,
	entities: ['dist/db/entities/*.js'],
	migrations: ['dist/db/migrations/*.js'],
};

const dataSource = new DataSource(databaseConfig);
export default dataSource;
