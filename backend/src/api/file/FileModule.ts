// import { Module } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';

// import { FileRepository, IFileRepository } from 'src/api/file/repositories/FileRepository';
// import { IDatabaseService } from 'src/db/DatabaseService';
// import { MariaDBModule } from 'src/db/mariadb.module';
// import { MariaDBService } from 'src/db/mariadb.service';
// import { FileController } from './file.controller';
// import { FileService } from './file.service';

// @Module({
// 	imports: [MariaDBModule],
// 	controllers: [FileController],
// 	providers: [
// 		FileService,
// 		ConfigService,
// 		{
// 			provide: IFileRepository,
// 			inject: [MariaDBService],
// 			useFactory: (databaseService: IDatabaseService) => {
// 				return new FileRepository(databaseService);
// 			},
// 		},
// 	],
// })
// export class FileModule {}
