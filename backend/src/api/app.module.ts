import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from 'src/env.config';
import { FilesModule } from './files/files.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `../.${process.env.NODE_ENV?.trim() || 'dev'}.env`,
			expandVariables: true,
			validate: validate,
		}),
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
})
export class AppModule {}
