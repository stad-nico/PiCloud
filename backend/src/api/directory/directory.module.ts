import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DirectoryController } from 'src/api/directory/directory.controller';
import { DirectoryService } from 'src/api/directory/directory.service';
import { DirectoryRepository, IDirectoryRepository } from 'src/api/file/repositories/DirectoryRepository';
import { IDatabaseService } from 'src/db/DatabaseService';
import { MariaDBModule } from 'src/db/mariadb.module';
import { MariaDBService } from 'src/db/mariadb.service';

@Module({
	imports: [MariaDBModule],
	controllers: [DirectoryController],
	providers: [
		DirectoryService,
		ConfigService,
		{
			provide: IDirectoryRepository,
			inject: [MariaDBService],
			useFactory: (databaseService: IDatabaseService) => {
				return new DirectoryRepository(databaseService);
			},
		},
	],
})
export class DirectoryModule {}
