import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from './files/files.module';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'mysql',
			host: 'localhost',
			port: 3306,
			username: 'root',
			password: 'mysqldev',
			database: 'cloud',
			autoLoadEntities: true,
			synchronize: true,
		}),

		FilesModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
