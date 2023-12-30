import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DirectoryModule } from 'src/api/directory/directory.module';
import { MariaDBModule } from 'src/db/mariadb.module';
import { DiskModule } from 'src/disk/disk.module';
import { validate } from 'src/env.config';

export const AppModuleConfig = {
	imports: [
		ConfigModule.forRoot({
			envFilePath: `../${(process.env.NODE_ENV ?? 'dev').trim()}.env`,
			expandVariables: true,
			validate: validate,
		}),
		MariaDBModule,

		DiskModule.forRootAsync(),

		// FileModule,
		DirectoryModule,
	],
};

@Module(AppModuleConfig)
export class AppModule {}
