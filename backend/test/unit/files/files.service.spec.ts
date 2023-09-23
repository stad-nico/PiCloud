import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadEntity } from 'src/api/files/entities/file.upload.entity';
import { FilesService } from 'src/api/files/files.service';
import { Error } from 'src/util/Error';
import { mockedDataSource } from 'test/mock/mockedDataSource.spec';
import { mockedEntityManager } from 'test/mock/mockedEntityManager.spec';
import { mockedFileUtils } from 'test/mock/mockedFileUtils.spec';
import { DataSource } from 'typeorm';

jest.mock('src/util/FileUtils.ts', () => {
	return mockedFileUtils;
});

describe('FilesService', () => {
	let service: FilesService;

	let file = {
		mimetype: 'text/plain',
		buffer: Buffer.from(''),
		size: 0,
	};

	let dto = FileUploadEntity.from('test/test.txt', file);

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [FilesService, { provide: DataSource, useValue: mockedDataSource }],
		}).compile();

		service = module.get<FilesService>(FilesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it("should return error 'file already exists' in db layer", async () => {
		mockedEntityManager.exists = jest.fn().mockResolvedValue(true);

		await expect(service.upload(dto)).resolves.not.toThrowError();
		await expect(service.upload(dto)).resolves.toStrictEqual(new Error('file at test/test.txt already exists', HttpStatus.CONFLICT));
	});

	it("should return error 'file already exists' in fs layer", async () => {
		mockedEntityManager.exists = jest.fn().mockResolvedValue(false);
	});
});
