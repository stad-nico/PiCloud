import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from 'src/EnvConfig';
import { DirectoryModule } from 'src/api/directory/DirectoryModule';
import { FileModule } from 'src/api/file/FileModule';
import { DiskModule } from 'src/disk/DiskModule';

export const AppModuleConfig = {
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `../${(process.env.NODE_ENV ?? 'dev').trim()}.env`,
			expandVariables: true,
			validate: validate,
		}),

		MikroOrmModule.forRoot(),

		DiskModule.forRootAsync(),

		FileModule,
		DirectoryModule,
	],
};

@Module(AppModuleConfig)
export class AppModule {}
