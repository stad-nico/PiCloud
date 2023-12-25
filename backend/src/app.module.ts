import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MariaDBModule } from 'src/db/mariadb.module';
import { DiskModule } from 'src/disk/disk.module';
import { validate } from 'src/env.config';
import { FileModule } from './api/file/file.module';

export const AppModuleConfig = {
	imports: [
		ConfigModule.forRoot({
			envFilePath: `../${(process.env.NODE_ENV ?? 'dev').trim()}.env`,
			expandVariables: true,
			validate: validate,
		}),
		MariaDBModule,

		DiskModule.forRootAsync(),

		FileModule,
	],
};

@Module(AppModuleConfig)
export class AppModule {}
