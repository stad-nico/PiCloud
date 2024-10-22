import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DiskService } from 'src/disk/DiskService';

@Module({
	providers: [DiskService, ConfigService],
	exports: [DiskService],
})
export class DiskModule {
	public static async forRootAsync(): Promise<DynamicModule> {
		return {
			module: DiskModule,
			providers: [
				{
					provide: DiskService,
					inject: [ConfigService],
					useFactory: async (configService: ConfigService) => {
						const service = new DiskService(configService);
						await service.init();

						return service;
					},
				},
				ConfigService,
			],
		};
	}
}
