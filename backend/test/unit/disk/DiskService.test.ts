import * as fsPromises from 'fs/promises';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import path from 'path';
import { Environment, NodeEnv } from 'src/config/EnvConfig';
import { DiskService, StoragePath } from 'src/disk/DiskService';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

jest.mock('fs');
jest.mock('fs/promises');

describe('DiskService', () => {
	const configPath = 'configPath';
	let configService: ConfigService;
	let service: DiskService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DiskService,
				{
					provide: ConfigService,
					useValue: {
						getOrThrow: (property: string) => {
							if (property === Environment.StoragePath) {
								return configPath;
							}
						},
					},
				},
			],
		}).compile();

		module.useLogger(false);

		service = module.get(DiskService);
		configService = module.get(ConfigService);
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('beforeApplicationShutdown', () => {
		it('should do nothing if in production', async () => {
			const deleteDirectorySpy = jest.spyOn(FileUtils, 'deleteDirectoryOrFail');
			jest.spyOn(configService, 'getOrThrow').mockImplementation((property: string) => {
				if (property === Environment.NodeENV) {
					return NodeEnv.Production;
				}
			});

			await service['beforeApplicationShutdown']();

			expect(deleteDirectorySpy).not.toHaveBeenCalled();
		});

		it('should clean up if in develop', async () => {
			const deleteDirectorySpy = jest.spyOn(FileUtils, 'deleteDirectoryOrFail');
			jest.spyOn(configService, 'getOrThrow').mockImplementationOnce((property: string) => {
				if (property === Environment.NodeENV) {
					return NodeEnv.Develop;
				}
			});

			await service['beforeApplicationShutdown']();

			expect(deleteDirectorySpy).toHaveBeenCalled();
		});

		it('should clean up if in test', async () => {
			const deleteDirectorySpy = jest.spyOn(FileUtils, 'deleteDirectoryOrFail');
			jest.spyOn(configService, 'getOrThrow').mockImplementationOnce((property: string) => {
				if (property === Environment.NodeENV) {
					return NodeEnv.Testing;
				}
			});

			await service['beforeApplicationShutdown']();

			expect(deleteDirectorySpy).toHaveBeenCalled();
		});
	});

	describe('init', () => {
		it(`should call 'initStorageLocation'`, async () => {
			const spy = jest.spyOn(DiskService.prototype as any, 'initStorageLocation').mockImplementationOnce(() => {});

			await service.init();

			expect(spy).toHaveBeenCalled();
			spy.mockRestore();
		});
	});

	describe('initStorageLocation', () => {
		it('should catch the error and rethrow error message', async () => {
			const expectedError = new Error(`Could not create storage location '${configPath}': error`);

			jest.spyOn(PathUtils, 'pathExists').mockResolvedValue(false);
			jest.spyOn(FileUtils, 'createDirectoryIfNotPresent').mockRejectedValue('error');

			await expect(service['initStorageLocation']()).rejects.toThrow(expectedError);
		});

		it('should initialize nothing if the storage location path and data folder already exists', async () => {
			const createDirSpy = jest.spyOn(FileUtils, 'createDirectoryIfNotPresent');

			jest.spyOn(PathUtils, 'pathExists').mockResolvedValue(true);
			jest.spyOn(fsPromises, 'statfs').mockResolvedValueOnce({ bsize: 10n, bfree: 180n } as any);

			await service['initStorageLocation']();

			expect(createDirSpy).not.toHaveBeenCalled();
		});

		it('should initialize both the storage location path and the data folder if both dont exist', async () => {
			const createDirSpy = jest.spyOn(FileUtils, 'createDirectoryIfNotPresent');
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValue(false);
			jest.spyOn(fsPromises, 'statfs').mockResolvedValueOnce({ bsize: 10n, bfree: 180n } as any);

			await service['initStorageLocation']();

			expect(createDirSpy).toHaveBeenNthCalledWith(1, configPath);
			expect(createDirSpy).toHaveBeenLastCalledWith(path.join(configPath, StoragePath.Data));
		});

		it('should initialize only the data folder if the storage location already exists but the data folder not', async () => {
			const createDirSpy = jest.spyOn(FileUtils, 'createDirectoryIfNotPresent');
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValueOnce(false);
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValueOnce(true);
			jest.spyOn(fsPromises, 'statfs').mockResolvedValueOnce({ bsize: 10n, bfree: 180n } as any);

			await service['initStorageLocation']();

			expect(createDirSpy).toHaveBeenCalledWith(path.join(configPath, StoragePath.Data));
		});
	});

	describe('formatBytes', () => {
		it('should return 0 Bytes', () => {
			expect(service['formatBytes']('f' as any, 0)).toStrictEqual('0 Bytes');
		});

		it('should use 0 for fixed if decimals is negative', () => {
			expect(service['formatBytes'](53464, -1)).toStrictEqual('52 KiB');
		});
	});
});
