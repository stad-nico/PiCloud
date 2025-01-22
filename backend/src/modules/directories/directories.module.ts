/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { Directory } from 'src/db/entities/directory.entity';
import { DirectoriesController } from 'src/modules/directories/directories.controller';
import { DirectoriesRepository } from 'src/modules/directories/directories.repository';
import { DirectoriesService } from 'src/modules/directories/directories.service';
import { IDirectoriesRepository } from 'src/modules/directories/IDirectoriesRepository';
import { IDirectoriesService } from 'src/modules/directories/IDirectoriesService';

@Module({
	imports: [ConfigModule, MikroOrmModule.forFeature([Directory])],
	controllers: [DirectoriesController],
	providers: [
		{
			provide: IDirectoriesService,
			useClass: DirectoriesService,
		},
		{
			provide: IDirectoriesRepository,
			useClass: DirectoriesRepository,
		},
	],
})
export class DirectoriesModule {}
