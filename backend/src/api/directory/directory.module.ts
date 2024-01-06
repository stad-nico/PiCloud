import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DirectoryController } from 'src/api/directory/directory.controller';
import { DirectoryRepository } from 'src/api/directory/directory.repository';
import { DirectoryService } from 'src/api/directory/directory.service';
import { Directory } from 'src/db/entities/Directory';

@Module({
	imports: [ConfigModule, TypeOrmModule.forFeature([Directory])],
	controllers: [DirectoryController],
	providers: [DirectoryService, DirectoryRepository],
})
export class DirectoryModule {}
