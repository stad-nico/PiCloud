import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DirectoryController } from 'src/api/directory/directory.controller';
import { DirectoryService } from 'src/api/directory/directory.service';

@Module({
	imports: [ConfigModule],
	controllers: [DirectoryController],
	providers: [DirectoryService],
})
export class DirectoryModule {}
