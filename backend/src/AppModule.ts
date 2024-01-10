import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DirectoryModule } from 'src/api/directory/DirectoryModule';
import { DiskModule } from 'src/disk/DiskModule';
import { validate } from 'src/EnvConfig';

import { databaseConfig } from 'src/db/DbConfig';

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

		DirectoryModule,
	],
};

@Module(AppModuleConfig)
export class AppModule {}
