import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Environment } from 'src/env.config';

@Module({
	imports: [
		ConfigModule,
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'mariadb',
				host: configService.getOrThrow(Environment.DBHost),
				port: configService.getOrThrow(Environment.DBPort),
				username: configService.getOrThrow(Environment.DBUsername),
				password: configService.getOrThrow(Environment.DBPassword),
				database: configService.getOrThrow(Environment.DBName),
				synchronize: true,
				entities: [], //[Directory, File, Tree],
				migrationsTableName: 'migrations',
				migrationsTransactionMode: 'each',
				migrations: ['src/db/migrations/**.ts'],
				// autoLoadEntities: true,
			}),
		}),
	],
})
export class DatabaseModule {}
