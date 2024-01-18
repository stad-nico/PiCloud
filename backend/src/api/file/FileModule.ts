import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DirectoryRepository } from 'src/api/directory/DirectoryRepository';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { FileController } from 'src/api/file/FileController';
import { FileRepository } from 'src/api/file/FileRepository';
import { FileService } from 'src/api/file/FileService';
import { IFileRepository } from 'src/api/file/IFileRepository';
import { File } from 'src/db/entities/File';

@Module({
	imports: [ConfigModule, MikroOrmModule.forFeature([File])],
	controllers: [FileController],
	providers: [
		FileService,
		{
			provide: IDirectoryRepository,
			useClass: DirectoryRepository,
		},
		{
			provide: IFileRepository,
			useClass: FileRepository,
		},
	],
})
export class FileModule {}
