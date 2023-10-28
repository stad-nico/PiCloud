import { ConfigService } from '@nestjs/config';

import { DiskService } from 'src/disk/disk.service';
import { NodeEnv } from 'src/env.config';
import { FileUtils } from 'src/util/FileUtils';

describe('disk.service.ts', () => {
	let configService: ConfigService = {
		get: () => {},
		getOrThrow: () => {},
	} as unknown as ConfigService;

	describe('cleanup', () => {
		it('should not cleanup on shutdown if NODE_ENV=prod', async () => {
			jest.spyOn(configService, 'get').mockReturnValue(NodeEnv.Production);
			jest.spyOn(FileUtils, 'deleteDirectoryOrFail').mockImplementation();

			const diskService = new DiskService(configService);
			await diskService.beforeApplicationShutdown();

			expect(diskService['shouldCleanupOnShutdown']).toBeFalsy();
			expect(FileUtils.deleteDirectoryOrFail).not.toHaveBeenCalled();
		});

		it('should cleanup on shutdown if NODE_ENV=test', async () => {
			jest.spyOn(configService, 'get').mockReturnValue(NodeEnv.Testing);
			jest.spyOn(FileUtils, 'deleteDirectoryOrFail').mockImplementation();

			const diskService = new DiskService(configService);
			await diskService.beforeApplicationShutdown();

			expect(diskService['shouldCleanupOnShutdown']).toBeTruthy();
			expect(FileUtils.deleteDirectoryOrFail).toHaveBeenCalled();
		});

		it('should cleanup on shutdown if NODE_ENV=dev', async () => {
			jest.spyOn(configService, 'get').mockReturnValue(NodeEnv.Develop);
			jest.spyOn(FileUtils, 'deleteDirectoryOrFail').mockImplementation();

			const diskService = new DiskService(configService);
			await diskService.beforeApplicationShutdown();

			expect(diskService['shouldCleanupOnShutdown']).toBeTruthy();
			expect(FileUtils.deleteDirectoryOrFail).toHaveBeenCalled();
		});
	});

	it('should throw error on init', async () => {
		jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(false);
		jest.spyOn(FileUtils, 'createDirectoryIfNotPresent').mockRejectedValue('error');
		jest.spyOn(configService, 'getOrThrow').mockReturnValue('test');

		const diskService = new DiskService(configService);

		await expect(diskService.init()).rejects.toStrictEqual(new Error(`Could not create the storage location test: error`));
	});

	describe('formatBytes', () => {
		it('should return 0 Bytes', () => {
			const diskService = new DiskService(configService);

			expect(diskService['formatBytes']('f' as any, 0)).toStrictEqual('0 Bytes');
		});

		it('should take 0 for fixed if decimals is negative', () => {
			const diskService = new DiskService(configService);

			expect(diskService['formatBytes'](53464, -1)).toStrictEqual('52 KiB');
		});
	});
});
