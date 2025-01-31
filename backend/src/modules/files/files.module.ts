/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Directory } from 'src/db/entities/directory.entity';

import { File } from 'src/db/entities/file.entity';
import { FileService } from 'src/modules/files/file.service';
import { FilesController } from 'src/modules/files/files.controller';

@Module({
	imports: [ConfigModule, MikroOrmModule.forFeature([File, Directory])],
	controllers: [FilesController],
	providers: [FileService],
})
export class FilesModule {}
