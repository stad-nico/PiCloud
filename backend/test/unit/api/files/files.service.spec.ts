import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { FileUploadDto } from 'src/api/files/dtos';
import { FilesService } from 'src/api/files/files.service';
import { FileDownloadResponse, FileMetadataResponse, FileUploadResponse } from 'src/api/files/responses';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';
import { mockedDataSource } from 'test/mock/mockedDataSource.spec';
import { mockedEntityManager } from 'test/mock/mockedEntityManager.spec';

import * as fs from 'fs';
import * as fsPromises from 'fs/promises';

// prevents any modification to fs because jest.fn() returns undefined by default
jest.mock('fs/promises', () => ({
	writeFile: jest.fn(),
	mkdir: jest.fn(),
}));

describe('FilesService', () => {
	let service: FilesService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FilesService,
				{ provide: DataSource, useValue: mockedDataSource },
				{
					provide: ConfigService,
					useValue: {
						getOrThrow: () => {
							return 'abcde';
						},
					},
				},
			],
		}).compile();

		module.useLogger(false);
		service = module.get(FilesService);
	});

	describe('upload', () => {
		const file = {
			mimetype: 'text/plain',
			buffer: Buffer.from(''),
			size: 0,
		};

		beforeEach(() => {
			jest.spyOn(mockedEntityManager, 'exists').mockResolvedValue(false);
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(false);
		});

		it("should throw error 'file already exists' in db layer", async () => {
			jest.spyOn(mockedEntityManager, 'exists').mockResolvedValue(true);

			const dto = FileUploadDto.from('test/test.txt', file);

			await expect(service.upload(dto)).rejects.toStrictEqual(
				new ServerError('file at test/test.txt already exists', HttpStatus.CONFLICT)
			);
		});

		it("should throw error 'path is not a valid path' in fs layer", async () => {
			const dto = FileUploadDto.from('../test/t.txt', file);

			await expect(service.upload(dto)).rejects.toStrictEqual(
				new ServerError('path must be a valid file path', HttpStatus.BAD_REQUEST)
			);
		});

		it("should throw error 'file already exists' in fs layer", async () => {
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(true);

			const dto = FileUploadDto.from('test.txt', file);

			await expect(service.upload(dto)).rejects.toStrictEqual(
				new ServerError('file at test.txt already exists', HttpStatus.CONFLICT)
			);
		});

		it("should throw error 'could not create file'", async () => {
			const error = new Error('could not create file');
			jest.spyOn(fsPromises, 'writeFile').mockRejectedValue(error);

			const dto = FileUploadDto.from('test.txt', file);

			await expect(service.upload(dto)).rejects.toStrictEqual(error);
		});

		it('should create file without error', async () => {
			jest.spyOn(mockedEntityManager, 'save').mockResolvedValue({ fullPath: 'test' });
			jest.spyOn(fsPromises, 'writeFile').mockResolvedValue();

			const dto = FileUploadDto.from('test.txt', file);

			await expect(service.upload(dto)).resolves.toStrictEqual(new FileUploadResponse('test'));
		});
	});

	describe('get metadata', () => {
		it("should throw error 'file does not exist'", async () => {
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValue(null);

			await expect(service.getMetadata({ path: 'test/t.txt' })).rejects.toStrictEqual(
				new ServerError('file at test/t.txt does not exist', HttpStatus.NOT_FOUND)
			);
		});

		it('should return file metadata', async () => {
			const response = new FileMetadataResponse('', '', '', '', 0, new Date(), new Date());
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValue(response);

			await expect(service.getMetadata({ path: '' })).resolves.toStrictEqual(response);
		});
	});

	describe('download', () => {
		it("should throw error 'file does not exist' in db layer", async () => {
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(null);

			await expect(service.download({ path: 'test/t.txt' })).rejects.toStrictEqual(
				new ServerError('file at test/t.txt does not exist', HttpStatus.NOT_FOUND)
			);
		});

		it("should throw error 'file does not exist' in fs layer", async () => {
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce({ fullPath: 'test/t.txt' });
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValueOnce(false);

			await expect(service.download({ path: 'test/t.txt' })).rejects.toStrictEqual(
				new ServerError('file at test/t.txt does not exist', HttpStatus.NOT_FOUND)
			);
		});

		it('should return response dto', async () => {
			const file = {
				fullPath: 'test/test.txt',
				name: 'test.txt',
				mimeType: 'mimeTest',
			};

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValue(file);
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(true);
			jest.spyOn(fs, 'createReadStream').mockReturnValue('teststream' as any);

			await expect(service.download({ path: '' } as any)).resolves.toStrictEqual(
				FileDownloadResponse.from('test.txt', 'mimeTest', 'teststream' as any)
			);
		});
	});
});
