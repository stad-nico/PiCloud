import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { DirectoryController } from 'src/api/directory/directory.controller';
import { DirectoryService } from 'src/api/directory/directory.service';
import { Directory } from 'src/db/entities/Directory';

@Module({
	imports: [MikroOrmModule.forFeature([Directory])],
	controllers: [DirectoryController],
	providers: [DirectoryService],
})
export class DirectoryModule {}
