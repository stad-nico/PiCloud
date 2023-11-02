import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { DiskService } from 'src/disk/disk.service';

describe('DiskService', () => {
	let service: DiskService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DiskService,
				{
					provide: ConfigService,
					useValue: {
						get: () => {},
						getOrThrow: () => {},
					},
				},
			],
		}).compile();

		module.useLogger(false);
		service = module.get(DiskService);
	});

	describe('formatBytes', () => {
		it('should return 0 Bytes', () => {
			expect(service['formatBytes']('f' as any, 0)).toStrictEqual('0 Bytes');
		});

		it('should take 0 for fixed if decimals is negative', () => {
			expect(service['formatBytes'](53464, -1)).toStrictEqual('52 KiB');
		});
	});
});
