import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs/promises';
import { FileUploadEntity } from 'src/api/files/entities/file.upload.entity';
import { FilesService } from 'src/api/files/files.service';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';
import { mockedDataSource } from 'test/mock/mockedDataSource.spec';
import { mockedEntityManager } from 'test/mock/mockedEntityManager.spec';
import { DataSource } from 'typeorm';

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

		it("should return error 'file already exists' in db layer", async () => {
			jest.spyOn(mockedEntityManager, 'exists').mockResolvedValue(true);

			const dto = FileUploadEntity.from('test/test.txt', file);

			await expect(service.upload(dto)).resolves.toStrictEqual(
				new ServerError('file at test/test.txt already exists', HttpStatus.CONFLICT)
			);
		});

		it("should return error 'path is not a valid path' in fs layer", async () => {
			const dto = FileUploadEntity.from('../test/t.txt', file);

			await expect(service.upload(dto)).resolves.toStrictEqual(
				new ServerError('path ../test/t.txt is not a valid path', HttpStatus.BAD_REQUEST)
			);
		});

		it("should return error 'file already exists' in fs layer", async () => {
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(true);

			const dto = FileUploadEntity.from('test.txt', file);

			await expect(service.upload(dto)).resolves.toStrictEqual(
				new ServerError('file at test.txt already exists', HttpStatus.CONFLICT)
			);
		});

		it("should return error 'something went wrong'", async () => {
			jest.spyOn(fs, 'writeFile').mockRejectedValue(new Error());

			const dto = FileUploadEntity.from('test.txt', file);

			await expect(service.upload(dto)).resolves.toStrictEqual(new ServerError('something went wrong', HttpStatus.CONFLICT));
		});

		it('should create file without error', async () => {
			jest.spyOn(mockedEntityManager, 'save').mockResolvedValue('test');
			jest.spyOn(fs, 'writeFile').mockResolvedValue();

			const dto = FileUploadEntity.from('test.txt', file);

			await expect(service.upload(dto)).resolves.toStrictEqual('test');
		});
	});
});
