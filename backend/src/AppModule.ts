/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from 'src/config/env.config';
import { DirectoriesModule } from 'src/modules/directories/directories.module';
import { DiskModule } from 'src/modules/disk/DiskModule';
import { FilesModule } from 'src/modules/files/files.module';

export const AppModuleConfig = {
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `${process.env.NODE_ENV ?? 'dev'}.env`,
			expandVariables: true,
			validate: validate,
		}),

		MikroOrmModule.forRoot(),

		DiskModule.forRootAsync(),

		FilesModule,
		DirectoriesModule,
	],
};

@Module(AppModuleConfig)
export class AppModule {}
