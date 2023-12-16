import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { File } from 'src/db/entities/File';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
	imports: [MikroOrmModule.forFeature([File])],
	controllers: [FileController],
	providers: [FileService, ConfigService],
})
export class FileModule {}
