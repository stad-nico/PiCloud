import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DirectoryModule } from 'src/api/directory/directory.module';
import { DiskModule } from 'src/disk/disk.module';
import { validate } from 'src/env.config';

import { databaseConfig } from 'src/db/db.config';

export const AppModuleConfig = {
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `../${(process.env.NODE_ENV ?? 'dev').trim()}.env`,
			expandVariables: true,
			validate: validate,
		}),

		TypeOrmModule.forRoot(databaseConfig),

		DiskModule.forRootAsync(),

		DirectoryModule,
	],
};

@Module(AppModuleConfig)
export class AppModule {}
