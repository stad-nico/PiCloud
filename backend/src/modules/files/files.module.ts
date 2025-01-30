/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { File } from 'src/db/entities/file.entity';
import { DirectoriesRepository } from 'src/modules/directories/directories.repository';
import { FilesController } from 'src/modules/files/files.controller';
import { FileRepository } from 'src/modules/files/files.repository';
import { FilesService } from 'src/modules/files/files.service';
import { IFilesRepository } from 'src/modules/files/IFilesRepository';

@Module({
	imports: [ConfigModule, MikroOrmModule.forFeature([File])],
	controllers: [FilesController],
	providers: [
		FilesService,
		DirectoriesRepository,
		{
			provide: IFilesRepository,
			useClass: FileRepository,
		},
	],
})
export class FilesModule {}
