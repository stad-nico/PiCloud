import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MySqlService } from 'src/db/mysql.service';

@Module({
	providers: [MySqlService, ConfigService],
	exports: [MySqlService],
})
export class MySqlModule {
	public static async forRootAsync(): Promise<DynamicModule> {
		return {
			module: MySqlModule,
			providers: [
				ConfigService,
				{
					provide: MySqlService,
					inject: [ConfigService],
					useFactory: async (configService: ConfigService) => {
						const service = new MySqlService(configService);
						await service.init();

						return service;
					},
				},
			],
		};
	}
}
