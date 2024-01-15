import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DirectoryController } from 'src/api/directory/DirectoryController';
import { DirectoryRepository } from 'src/api/directory/DirectoryRepository';
import { DirectoryService } from 'src/api/directory/DirectoryService';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { Directory } from 'src/db/entities/Directory';

@Module({
	imports: [ConfigModule, MikroOrmModule.forFeature([Directory])],
	controllers: [DirectoryController],
	providers: [
		DirectoryService,
		{
			provide: IDirectoryRepository,
			useClass: DirectoryRepository,
		},
	],
})
export class DirectoryModule {}
