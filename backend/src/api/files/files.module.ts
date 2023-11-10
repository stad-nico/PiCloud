import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { File } from 'src/api/files/entities/file.entity';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
	imports: [TypeOrmModule.forFeature([File])],
	controllers: [FilesController],
	providers: [FilesService, ConfigService],
})
export class FilesModule {}
