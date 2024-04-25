import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { Archiver } from 'archiver';
import { StoragePath } from 'src/disk/DiskService';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';
import { Readable } from 'stream';

const archiver = jest.requireActual('archiver');

// jest.mock('archiver');
jest.mock('fs');
jest.mock('fs/promises');

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
		jest.resetAllMocks();
	});

	describe('deleteDirectoryOrFail', () => {
		it('should throw error if fs.rm throws error', async () => {
			const error = new Error('test');
			jest.spyOn(fsPromises, 'rm').mockRejectedValue(error);

			await expect(FileUtils.deleteDirectoryOrFail('')).rejects.toStrictEqual(error);

			expect(fsPromises.rm).toHaveBeenCalledWith('', { recursive: true });
		});

		it('should not throw error if fs.rm does not throw error', async () => {
			jest.spyOn(fsPromises, 'rm').mockResolvedValue(undefined);

			await expect(FileUtils.deleteDirectoryOrFail('', false)).resolves.not.toThrow();

			expect(fsPromises.rm).toHaveBeenCalledWith('', { recursive: false });
		});
	});

	describe('createDirectoryIfNotPresent', () => {
		it('should not create dir if already present', async () => {
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValue(true);

			await FileUtils.createDirectoryIfNotPresent('test');

			expect(fsPromises.mkdir).not.toHaveBeenCalled();
		});

		it('should create dir if not already present', async () => {
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValue(false);

			await FileUtils.createDirectoryIfNotPresent('test', false);

			expect(fsPromises.mkdir).toHaveBeenCalled();
		});
	});

	describe('writeFile', () => {
		it('should not create parent directory if recursive=false', async () => {
			jest.spyOn(fsPromises, 'writeFile').mockResolvedValueOnce();
			const mkdirSpy = jest.spyOn(fsPromises, 'mkdir');

			await expect(FileUtils.writeFile('file.txt', Readable.from(Buffer.from('test')), false)).resolves.not.toThrow();
			expect(mkdirSpy).not.toHaveBeenCalled();
		});

		it('should create parent directory if recursive=true', async () => {
			const filename = 'parent/file.txt';

			jest.spyOn(fsPromises, 'writeFile').mockResolvedValueOnce();
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValueOnce(false);
			const mkdirSpy = jest.spyOn(fsPromises, 'mkdir');

			await expect(FileUtils.writeFile(filename, Readable.from(Buffer.from('test')), true)).resolves.not.toThrow();
			expect(mkdirSpy).toHaveBeenCalledWith(PathUtils.prepareForFS(path.dirname(filename)), { recursive: true });
		});

		it('should create parent directory if recursive not given', async () => {
			const filename = 'parent/file.txt';

			jest.spyOn(fsPromises, 'writeFile').mockResolvedValueOnce();
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValueOnce(false);
			const mkdirSpy = jest.spyOn(fsPromises, 'mkdir');

			await expect(FileUtils.writeFile(filename, Readable.from(Buffer.from('test')))).resolves.not.toThrow();
			expect(mkdirSpy).toHaveBeenCalledWith(PathUtils.prepareForFS(path.dirname(filename)), { recursive: true });
		});
	});

	describe('copyFile', () => {
		it('should not create parent directory if recursive=false', async () => {
			jest.spyOn(fsPromises, 'copyFile').mockResolvedValueOnce();
			const mkdirSpy = jest.spyOn(fsPromises, 'mkdir');

			await expect(FileUtils.copyFile('file.txt', 'ttt/file.txt', false)).resolves.not.toThrow();
			expect(mkdirSpy).not.toHaveBeenCalled();
		});

		it('should create parent directory if recursive=true', async () => {
			const destinationPath = 'parent/file.txt';

			jest.spyOn(fsPromises, 'copyFile').mockResolvedValueOnce();
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValueOnce(false);
			const mkdirSpy = jest.spyOn(fsPromises, 'mkdir');

			await expect(FileUtils.copyFile('ttt/file.txt', destinationPath, true)).resolves.not.toThrow();
			expect(mkdirSpy).toHaveBeenCalledWith(PathUtils.prepareForFS(path.dirname(destinationPath)), { recursive: true });
		});

		it('should create parent directory if recursive not given', async () => {
			const destinationPath = 'parent/file.txt';

			jest.spyOn(fsPromises, 'copyFile').mockResolvedValueOnce();
			jest.spyOn(PathUtils, 'pathExists').mockResolvedValueOnce(false);
			const mkdirSpy = jest.spyOn(fsPromises, 'mkdir');

			await expect(FileUtils.copyFile('ttt/file.txt', destinationPath)).resolves.not.toThrow();
			expect(mkdirSpy).toHaveBeenCalledWith(PathUtils.prepareForFS(path.dirname(destinationPath)), { recursive: true });
		});
	});

	describe('emptyDirectory', () => {
		it('should delete everything from the directory', async () => {
			const dirPath = 'testPath';
			const items = ['file1', 'dir1', 'file2', 'file3'];

			jest.spyOn(fsPromises, 'readdir').mockResolvedValueOnce(items as any);
			const rmSpy = jest.spyOn(fsPromises, 'rm');

			await FileUtils.emptyDirectory(dirPath);

			for (let item of items) {
				expect(rmSpy).toHaveBeenCalledWith(path.join(dirPath, item), { recursive: true });
			}
		});
	});

	describe('createZIPArchive', () => {
		it('should add all files to the archive and resolve', async () => {
			const files = [
				{ id: 'aabbaaaa', path: 'file.txt' },
				{ id: 'aabbbbbb', path: 'file2.txt' },
				{ id: 'aabbcccc', path: 'dir/file.txt' },
			];

			const data = {
				aabbaaaa: 'testData1',
				aabbbbbb: 'testData2',
				aabbcccc: 'testData3',
			};

			jest.spyOn(PathUtils, 'uuidToDirPath').mockImplementation((uuid: string) => uuid);
			jest.spyOn(PathUtils, 'join').mockImplementation((cs: ConfigService, path: string, sp: StoragePath) => path);
			jest.spyOn(fs, 'createReadStream').mockImplementation(((path: string) => (data as any)[path]) as any);

			await expect(FileUtils.createZIPArchive(configService, files)).resolves.not.toThrow();
		});

		it('should reject if the archiver throws an error', async () => {
			let archiverInstance: Archiver = undefined as any;
			const create = archiver.create;

			jest.spyOn(archiver, 'create').mockImplementation(((format: 'zip') => {
				const archiver_ = create(format);
				archiverInstance = archiver_;
				return archiver_;
			}) as any);

			const result = FileUtils.createZIPArchive(configService, []);
			archiverInstance.emit('error', 'thisIsAnError');

			await expect(result).rejects.toStrictEqual('thisIsAnError');
		});
	});
});
