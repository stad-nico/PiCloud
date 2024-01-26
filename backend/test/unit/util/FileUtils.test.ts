import * as fs from 'fs/promises';
import * as path from 'path';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

jest.mock('fs/promises', () => ({
	access: jest.fn(),
	rm: jest.fn(),
	mkdir: jest.fn(),
	writeFile: jest.fn(),
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

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('deleteDirectoryOrFail', () => {
		it('should throw error if fs.rm throws error', async () => {
			const error = new Error('test');
			jest.spyOn(fs, 'rm').mockRejectedValue(error);

			await expect(FileUtils.deleteDirectoryOrFail('')).rejects.toStrictEqual(error);

			expect(fs.rm).toHaveBeenCalledWith('', { recursive: true });
		});

		it('should not throw error if fs.rm does not throw error', async () => {
			jest.spyOn(fs, 'rm').mockResolvedValue(undefined);

			await expect(FileUtils.deleteDirectoryOrFail('', false)).resolves.not.toThrow();

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

	describe('writeFile', () => {
		it('should recursively create the destination path and succeed writing the file', async () => {
			const destinationPath = 'test/path/to/file.txt';
			const buffer = Buffer.from('');

			jest.spyOn(PathUtils, 'pathExists').mockResolvedValue(false);

			await expect(FileUtils.writeFile(destinationPath, buffer)).resolves.not.toThrow();

			expect(fs.mkdir).toHaveBeenCalledWith(PathUtils.prepareForFS(path.dirname(destinationPath)), { recursive: true });
			expect(fs.writeFile).toHaveBeenCalledWith(PathUtils.prepareForFS(destinationPath), buffer);
		});
	});

	describe('copyFile', () => {});

	describe('emptyDirectory', () => {});

	describe('createZIPArchive', () => {});
});
