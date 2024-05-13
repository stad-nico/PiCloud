/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DirectoryController } from 'src/api/directory/DirectoryController';
import { DirectoryRepository } from 'src/api/directory/DirectoryRepository';
import { DirectoryService } from 'src/api/directory/DirectoryService';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { IDirectoryService } from 'src/api/directory/IDirectoryService';
import { Directory } from 'src/db/entities/Directory';

@Module({
	imports: [ConfigModule, MikroOrmModule.forFeature([Directory])],
	controllers: [DirectoryController],
	providers: [
		{
			provide: IDirectoryService,
			useClass: DirectoryService,
		},
		{
			provide: IDirectoryRepository,
			useClass: DirectoryRepository,
		},
	],
})
export class DirectoryModule {}
