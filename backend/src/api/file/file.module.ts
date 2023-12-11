import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { File } from 'src/api/file/entities/file.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
	imports: [TypeOrmModule.forFeature([File])],
	controllers: [FileController],
	providers: [FileService, ConfigService],
})
export class FileModule {}
