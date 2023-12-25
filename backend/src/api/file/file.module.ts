import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FileRepository, IFileRepository } from 'src/api/file/repositories/FileRepository';
import { IDatabaseService } from 'src/db/DatabaseService';
import { MariaDBService } from 'src/db/mariadb.service';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
	imports: [],
	controllers: [FileController],
	providers: [
		MariaDBService,
		FileService,
		ConfigService,
		{
			provide: IFileRepository,
			inject: [MariaDBService],
			useFactory: (databaseService: IDatabaseService) => {
				return new FileRepository(databaseService);
			},
		},
	],
})
export class FileModule {}
