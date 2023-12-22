import { Module } from '@nestjs/common';
import { DirectoryController } from 'src/api/directory/directory.controller';
import { DirectoryService } from 'src/api/directory/directory.service';

@Module({
	imports: [],
	controllers: [DirectoryController],
	providers: [DirectoryService],
})
export class DirectoryModule {}
