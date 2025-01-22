import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { StoragePath } from 'src/modules/disk/DiskService';
import { PathUtils } from 'src/util/PathUtils';

jest.mock('fs/promises');

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

	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('normalizeDirectoryPath', () => {
		it('should replace all backslashes with a single forward slash', () => {
			expect(PathUtils.normalizeDirectoryPath('\\\\test\\\\path\\to\\dir\\\\')).toStrictEqual('/test/path/to/dir/');
		});

		it('should replace leading dots', () => {
			expect(PathUtils.normalizeDirectoryPath('.///test//path/to/dir///')).toStrictEqual('/test/path/to/dir/');
			expect(PathUtils.normalizeDirectoryPath('..///test//path/to/dir///')).toStrictEqual('/test/path/to/dir/');
		});

		it('should ensure trailing slash', () => {
			expect(PathUtils.normalizeDirectoryPath('//test/dir//to///path')).toStrictEqual('/test/dir/to/path/');
		});

		it('should ensure leading slash', () => {
			expect(PathUtils.normalizeDirectoryPath('test/dir//to///path')).toStrictEqual('/test/dir/to/path/');
		});
	});

	describe('normalizeFilePath', () => {
		it('should replace all backslashes with a single forward slash', () => {
			expect(PathUtils.normalizeFilePath('\\\\test\\\\path\\to\\file.txt\\\\')).toStrictEqual('/test/path/to/file.txt');
		});

		it('should replace leading dots', () => {
			expect(PathUtils.normalizeFilePath('.///test//path/to/file.txt')).toStrictEqual('/test/path/to/file.txt');
			expect(PathUtils.normalizeFilePath('..///test//path/to/file.txt')).toStrictEqual('/test/path/to/file.txt');
		});

		it('should remove trailing slashes', () => {
			expect(PathUtils.normalizeFilePath('//test/path//to///file.txt//')).toStrictEqual('/test/path/to/file.txt');
		});

		it('should ensure leading slash', () => {
			expect(PathUtils.normalizeFilePath('test/path//to///file.txt//')).toStrictEqual('/test/path/to/file.txt');
		});
	});

	describe('prepareFilePathForFS', () => {
		it('should replace forward slashes with `path.sep`', () => {
			const expectedPath = path.sep + 'test' + path.sep + 'path' + path.sep + 'to' + path.sep + 'file.txt';

			expect(PathUtils.prepareFilePathForFS('///test//path//to///file.txt')).toStrictEqual(expectedPath);
		});

		it('should replace backward slashes with `path.sep`', () => {
			const expectedPath = path.sep + 'test' + path.sep + 'path' + path.sep + 'to' + path.sep + 'file.txt';

			expect(PathUtils.prepareFilePathForFS('\\\\test\\\\path\\to\\\\\\file.txt')).toStrictEqual(expectedPath);
		});

		it('should ensure leading slash', () => {
			const expectedPath = path.sep + 'test' + path.sep + 'path' + path.sep + 'to' + path.sep + 'file.txt';

			expect(PathUtils.prepareFilePathForFS('test\\\\path\\to\\\\\\file.txt')).toStrictEqual(expectedPath);
			expect(PathUtils.prepareFilePathForFS('test//path///to///file.txt')).toStrictEqual(expectedPath);
		});

		it('should remove trailing slashes', () => {
			const expectedPath = path.sep + 'test' + path.sep + 'path' + path.sep + 'to' + path.sep + 'file.txt';

			expect(PathUtils.prepareFilePathForFS('test\\\\path\\to\\\\\\file.txt\\\\')).toStrictEqual(expectedPath);
			expect(PathUtils.prepareFilePathForFS('test//path///to///file.txt//')).toStrictEqual(expectedPath);
		});
	});

	describe('pathExists', () => {
		it('should return false because file does not exist', async () => {
			jest.spyOn(fsPromises, 'access').mockRejectedValueOnce(new Error());

			await expect(PathUtils.pathExists('test')).resolves.toBe(false);
		});

		it('should return true because file exists', async () => {
			jest.spyOn(fsPromises, 'access').mockResolvedValue(undefined);

			await expect(PathUtils.pathExists('test')).resolves.toBe(true);
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

	describe('join', () => {
		it(`should join the path with the environment variable and 'data'`, async () => {
			expect(PathUtils.join(configService, StoragePath.Data, 'path')).toStrictEqual('test' + path.sep + StoragePath.Data + path.sep + 'path');
		});
	});

	describe('uuidToDirPath', () => {
		it('should convert uuid to directory path', () => {
			expect(PathUtils.uuidToDirPath('ded9d04b-b18f-4bce-976d-7a36acb42eb9')).toStrictEqual('de/d9/d04b-b18f-4bce-976d-7a36acb42eb9');
		});
	});

	describe('isDirectoryPathValid', () => {});

	describe('isFilePathValid', () => {});
});
