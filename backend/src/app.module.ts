/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { JwtModule } from '@nestjs/jwt';
import { validate } from 'src/config/env.config';
import { Directory } from 'src/db/entities/directory.entity';
import { User } from 'src/db/entities/user.entitiy';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JwtGuard } from 'src/modules/auth/jwt.guard';
import { DirectoriesModule } from 'src/modules/directories/directories.module';
import { DiskModule } from 'src/modules/disk/DiskModule';
import { FilesModule } from 'src/modules/files/files.module';
import { UsersModule } from 'src/modules/users/users.module';

export const AppModuleConfig = {
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `${process.env.NODE_ENV ?? 'dev'}.env`,
			expandVariables: true,
			validate: validate,
		}),

		JwtModule.register({ global: true, verifyOptions: { ignoreNotBefore: true } }),

		MikroOrmModule.forRoot(),
		MikroOrmModule.forFeature([User, Directory]),

		DiskModule.forRootAsync(),

		FilesModule,
		DirectoriesModule,
		UsersModule,
		AuthModule
	],
	providers: [{ provide: APP_GUARD, useClass: JwtGuard }],
};
@Module(AppModuleConfig)
export class AppModule {}
