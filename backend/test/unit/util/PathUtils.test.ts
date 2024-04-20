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

	describe('normalizeDirectoryPath', () => {});

	describe('normalizeFilePath', () => {});

	describe('prepareForFS', () => {});

	describe('pathExists', () => {
		it('should return false because file does not exist', async () => {
			(fs.access as jest.Mock).mockRejectedValue(new Error());

			await expect(PathUtils.pathExists('t.txt')).resolves.toBe(false);
		});

		it('should return true because file exists', async () => {
			(fs.access as jest.Mock).mockResolvedValue(undefined);

			await expect(PathUtils.pathExists('C:')).resolves.toBe(true);
		});
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

	describe('join', () => {});

	describe('uuidToDirPath', () => {});

	describe('isDirectoryPathValid', () => {});

	describe('isFilePathValid', () => {});
});
