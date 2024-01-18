import * as fs from 'fs/promises';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

jest.mock('fs/promises', () => ({
	access: jest.fn(),
	rm: jest.fn(),
	mkdir: jest.fn(),
}));

describe('FileUtils', () => {
	let configService: ConfigService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: ConfigService,
					useValue: {
						getOrThrow: () => {
							return 'test';
						},
					},
				},
			],
		}).compile();

		module.useLogger(false);
		configService = module.get(ConfigService);
	});

	describe('deleteDirectoryOrFail', () => {
		it('should throw error if fs.rm throws error', () => {
			(fs.rm as jest.Mock).mockRejectedValue(new Error('test'));

			expect(FileUtils.deleteDirectoryOrFail('')).rejects.toStrictEqual(new Error('test'));
			expect(fs.rm).toHaveBeenCalledWith('', { recursive: true });
		});

		it('should not throw error if fs.rm does not throw error', () => {
			(fs.rm as jest.Mock).mockResolvedValue(undefined);

			expect(FileUtils.deleteDirectoryOrFail('', false)).resolves.not.toThrow();
			expect(fs.rm).toHaveBeenCalledWith('', { recursive: false });
		});
	});

	describe('createDirectoryIfNotPresent', () => {
		it('should not create dir if already present', async () => {
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValue(true);

			await FileUtils.createDirectoryIfNotPresent('test');

			expect(fs.mkdir).not.toHaveBeenCalled();
		});

		it('should create dir if not already present', async () => {
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValue(false);

			await FileUtils.createDirectoryIfNotPresent('test', false);

			expect(fs.mkdir).toHaveBeenCalled();
		});
	});

	describe('writeFile', () => {});

	describe('copyFile', () => {});

	describe('emptyDirectory', () => {});

	describe('createZIPArchive', () => {});
});
