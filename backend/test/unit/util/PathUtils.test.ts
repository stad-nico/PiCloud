import * as fs from 'fs/promises';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { PathUtils } from 'src/util/PathUtils';

describe('PathUtils', () => {
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
			expect(PathUtils.isPathRelative(configService, 't/fff/t.txt')).toBe(true);
			expect(PathUtils.isPathRelative(configService, './t/fff/t.txt')).toBe(true);
			expect(PathUtils.isPathRelative(configService, '/t/fff/t.txt')).toBe(true);
		});

		it('should return true if path is a relative path in base dir', () => {
			expect(PathUtils.isPathRelative(configService, '/t.txt')).toBe(true);
			expect(PathUtils.isPathRelative(configService, './t.txt')).toBe(true);
			expect(PathUtils.isPathRelative(configService, 't.txt')).toBe(true);
		});

		it('should return false if path leaves base dir', () => {
			expect(PathUtils.isPathRelative(configService, '../t.txt')).toBe(false);
			expect(PathUtils.isPathRelative(configService, './../t.txt')).toBe(false);
			expect(PathUtils.isPathRelative(configService, './t/f/../../../f.txt')).toBe(false);
		});
	});

	describe('pathExists', () => {
		it('should return false because file does not exist', async () => {
			(fs.access as jest.Mock).mockRejectedValue(new Error());

			await expect(await PathUtils.pathExists('t.txt')).toBe(false);
		});

		it('should return true because file exists', async () => {
			(fs.access as jest.Mock).mockResolvedValue(undefined);

			await expect(await PathUtils.pathExists('C:')).toBe(true);
		});
	});

	describe('join', () => {
		it("should join the path with 'test' using path.join", () => {
			expect(PathUtils.join(configService, 't.txt', Environment.DiskStoragePath)).toBe(path.join('test', 't.txt'));
		});
	});

	describe('normalizePathForOS', () => {
		it('should replace slashes with path.sep', () => {
			expect(FileUtils['normalizePathForOS']('test/test.txt')).toBe('test/test.txt'.replaceAll(/(\/|\\)/gi, path.sep));
			expect(FileUtils['normalizePathForOS']('test\\test.txt')).toBe('test/test.txt'.replaceAll(/(\/|\\)/gi, path.sep));
		});
	});
});
