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
import { DirectoriesService } from 'src/modules/directories/directories.service';

@Module({
	imports: [ConfigModule, MikroOrmModule.forFeature([Directory])],
	controllers: [DirectoriesController],
	providers: [DirectoriesService],
})
export class DirectoriesModule {}
