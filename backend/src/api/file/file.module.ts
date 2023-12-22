import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FileDeleteRepository, IFileDeleteRepository } from 'src/api/file/repositories/FileDeleteRepository';
import { FileDownloadRepository, IFileDownloadRepository } from 'src/api/file/repositories/FileDownloadRepository';
import { FileMetadataRepository, IFileMetadataRepository } from 'src/api/file/repositories/FileMetadataRepository';
import { FileRenameRepository, IFileRenameRepository } from 'src/api/file/repositories/FileRenameRepository';
import { FileUploadRepository, IFileUploadRepository } from 'src/api/file/repositories/FileUploadRepository';
import { IDatabaseService } from 'src/db/DatabaseService';
import { MySqlService } from 'src/db/mysql.service';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
	imports: [],
	controllers: [FileController],
	providers: [
		MySqlService,
		FileService,
		ConfigService,
		{
			provide: IFileDownloadRepository,
			useFactory: (databaseService: IDatabaseService) => {
				return new FileDownloadRepository(databaseService);
			},
			inject: [MySqlService],
		},
		{
			provide: IFileDeleteRepository,
			useFactory: (databaseService: IDatabaseService) => {
				return new FileDeleteRepository(databaseService);
			},
			inject: [MySqlService],
		},
		{
			provide: IFileMetadataRepository,
			useFactory: (databaseService: IDatabaseService) => {
				return new FileMetadataRepository(databaseService);
			},
			inject: [MySqlService],
		},
		{
			provide: IFileRenameRepository,
			useFactory: (databaseService: IDatabaseService) => {
				return new FileRenameRepository(databaseService);
			},
			inject: [MySqlService],
		},
		{
			provide: IFileUploadRepository,
			useFactory: (databaseService: IDatabaseService) => {
				return new FileUploadRepository(databaseService);
			},
			inject: [MySqlService],
		},
	],
})
export class FileModule {}
