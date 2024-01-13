import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { databaseConfig } from 'src/DbConfig';
import { validate } from 'src/EnvConfig';
import { DirectoryModule } from 'src/api/directory/DirectoryModule';
import { FileModule } from 'src/api/file/FileModule';
import { DiskModule } from 'src/disk/DiskModule';

export const AppModuleConfig = {
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `../${(process.env.NODE_ENV ?? 'dev').trim()}.env`,
			expandVariables: true,
			validate: validate,
		}),

		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => databaseConfig(configService),
		}),

		DiskModule.forRootAsync(),

		FileModule,
		DirectoryModule,
	],
};

@Module(AppModuleConfig)
export class AppModule {}
