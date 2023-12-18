import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MySqlModule } from 'src/db/mysql.module';
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
		MySqlModule.forRootAsync(),
		// MikroOrmModule.forRoot({
		// 	host: 'localhost',
		// 	port: 3306,
		// 	dbName: 'cloud',
		// 	password: 'root',
		// 	user: 'root',
		// 	autoLoadEntities: true,
		// }),

		DiskModule.forRootAsync(),

		FileModule,
	],
};

@Module(AppModuleConfig)
export class AppModule {}
