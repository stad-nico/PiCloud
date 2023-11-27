import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DiskModule } from 'src/disk/disk.module';
import { validate } from 'src/env.config';
import { FilesModule } from './api/files/files.module';

export const AppModuleConfig = {
	imports: [
		ConfigModule.forRoot({
			envFilePath: `../.${(process.env.NODE_ENV ?? 'dev').trim()}.env`,
			expandVariables: true,
			validate: validate,
		}),
		TypeOrmModule.forRoot({
			bigNumberStrings: false,
			type: 'mysql',
			host: 'localhost',
			port: 3306,
			username: 'root',
			password: 'mysqldev',
			database: 'cloud',
			autoLoadEntities: true,
			synchronize: true,
		}),

		DiskModule.forRootAsync(),

		FilesModule,
	],
};

@Module(AppModuleConfig)
export class AppModule {}
