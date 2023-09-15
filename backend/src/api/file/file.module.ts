import { Module } from '@nestjs/common';
import { FileController } from 'src/api/file/file.controller';
import { FileService } from 'src/api/file/file.service';

@Module({
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
