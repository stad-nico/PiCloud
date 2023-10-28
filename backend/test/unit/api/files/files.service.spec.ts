import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { FileMetadataResponseDto } from 'src/api/files/dtos/file.metadata.response.dto';
import { FileUploadResponseDto } from 'src/api/files/dtos/file.upload.response.dto';
import { FileUploadEntity } from 'src/api/files/entities/file.upload.entity';
import { FilesService } from 'src/api/files/files.service';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';
import { mockedDataSource } from 'test/mock/mockedDataSource.spec';
import { mockedEntityManager } from 'test/mock/mockedEntityManager.spec';

import * as fs from 'fs/promises';

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

		module.useLogger(undefined as any);
		service = module.get<FilesService>(FilesService);
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

			const dto = FileUploadEntity.from('test/test.txt', file);

			await expect(service.upload(dto)).rejects.toStrictEqual(
				new ServerError('file at test/test.txt already exists', HttpStatus.CONFLICT)
			);
		});

		it("should throw error 'path is not a valid path' in fs layer", async () => {
			const dto = FileUploadEntity.from('../test/t.txt', file);

			await expect(service.upload(dto)).rejects.toStrictEqual(
				new ServerError('path ../test/t.txt is not a valid path', HttpStatus.BAD_REQUEST)
			);
		});

		it("should throw error 'file already exists' in fs layer", async () => {
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(true);

			const dto = FileUploadEntity.from('test.txt', file);

			await expect(service.upload(dto)).rejects.toStrictEqual(
				new ServerError('file at test.txt already exists', HttpStatus.CONFLICT)
			);
		});

		it("should throw error 'could not create file'", async () => {
			const error = new Error('could not create file');
			jest.spyOn(fs, 'writeFile').mockRejectedValue(error);

			const dto = FileUploadEntity.from('test.txt', file);

			await expect(service.upload(dto)).rejects.toStrictEqual(error);
		});

		it('should create file without error', async () => {
			jest.spyOn(mockedEntityManager, 'save').mockResolvedValue({ fullPath: 'test' });
			jest.spyOn(fs, 'writeFile').mockResolvedValue();

			const dto = FileUploadEntity.from('test.txt', file);

			await expect(service.upload(dto)).resolves.toStrictEqual(new FileUploadResponseDto('test'));
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
			const response = new FileMetadataResponseDto('', '', '', '', 0, new Date(), new Date());
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValue(response);

			await expect(service.getMetadata({ path: '' })).resolves.toStrictEqual(response);
		});
	});
});
