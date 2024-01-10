import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { FileUtils } from 'src/util/FileUtils';

import * as fs from 'fs/promises';
import * as path from 'path';
import { Environment } from 'src/EnvConfig';

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

	describe('isPathRelative', () => {
		it('should return true if path is a relative path that does not leave base dir', () => {
			expect(FileUtils.isPathRelative(configService, 't/fff/t.txt')).toBe(true);
			expect(FileUtils.isPathRelative(configService, './t/fff/t.txt')).toBe(true);
			expect(FileUtils.isPathRelative(configService, '/t/fff/t.txt')).toBe(true);
		});

		it('should return true if path is a relative path in base dir', () => {
			expect(FileUtils.isPathRelative(configService, '/t.txt')).toBe(true);
			expect(FileUtils.isPathRelative(configService, './t.txt')).toBe(true);
			expect(FileUtils.isPathRelative(configService, 't.txt')).toBe(true);
		});

		it('should return false if path leaves base dir', () => {
			expect(FileUtils.isPathRelative(configService, '../t.txt')).toBe(false);
			expect(FileUtils.isPathRelative(configService, './../t.txt')).toBe(false);
			expect(FileUtils.isPathRelative(configService, './t/f/../../../f.txt')).toBe(false);
		});
	});

	describe('pathExists', () => {
		it('should return false because file does not exist', async () => {
			(fs.access as jest.Mock).mockRejectedValue(new Error());

			await expect(await FileUtils.pathExists('t.txt')).toBe(false);
		});

		it('should return true because file does exists', async () => {
			(fs.access as jest.Mock).mockResolvedValue(undefined);

			await expect(await FileUtils.pathExists('C:')).toBe(true);
		});
	});

	describe('join', () => {
		it("should join the path with 'test' using path.join", () => {
			expect(FileUtils.join(configService, 't.txt', Environment.DiskStoragePath)).toBe(path.join('test', 't.txt'));
		});
	});

	describe('normalizePathForOS', () => {
		it('should replace slashes with path.sep', () => {
			expect(FileUtils['normalizePathForOS']('test/test.txt')).toBe('test/test.txt'.replaceAll(/(\/|\\)/gi, path.sep));
			expect(FileUtils['normalizePathForOS']('test\\test.txt')).toBe('test/test.txt'.replaceAll(/(\/|\\)/gi, path.sep));
		});
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
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(true);

			await FileUtils.createDirectoryIfNotPresent('test');

			expect(fs.mkdir).not.toBeCalled();
		});

		it('should create dir if not already present', async () => {
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(false);

			await FileUtils.createDirectoryIfNotPresent('test', false);

			expect(fs.mkdir).toBeCalled();
		});
	});
});
