import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { File } from 'src/api/files/entities/file.entity';
import { RecycledFile } from 'src/api/files/entities/recycledFile.entity';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
	imports: [TypeOrmModule.forFeature([File, RecycledFile])],
	controllers: [FilesController],
	providers: [FilesService, ConfigService],
})
export class FilesModule {}
