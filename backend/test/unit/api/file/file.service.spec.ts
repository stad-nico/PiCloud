import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';

import { FileService } from 'src/api/file/FileService';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';
import { mockedDataSource } from 'test/mocks/mockedDataSource.spec';
import { mockedEntityManager } from 'test/mocks/mockedEntityManager.spec';

import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import { FileDeleteDto, FileDeleteResponse } from 'src/api/file/classes/delete';
import { FileDownloadDto, FileDownloadResponse } from 'src/api/file/classes/download';
import { FileMetadataDto, FileMetadataResponse } from 'src/api/file/classes/metadata';
import { FileRenameDto, FileRenameResponse } from 'src/api/file/classes/rename';
import { FileRestoreDto, FileRestoreResponse } from 'src/api/file/classes/restore';
import { FileUploadDto, FileUploadResponse } from 'src/api/file/classes/upload';
import { File } from 'src/api/file/entities/file.entity';

// prevent any modification to fs
jest.mock('fs/promises', () => ({
	writeFile: jest.fn(),
	mkdir: jest.fn(),
	rm: jest.fn(),
}));

jest.mock('uuid', () => ({
	v4: jest.fn().mockReturnValue('testUuid'),
}));

describe('FileService', () => {
	let service: FileService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				FileService,
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
		service = module.get(FileService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('upload', () => {
		const file = {
			mimetype: 'text/plain',
			buffer: Buffer.from('buffer'),
			size: 0,
		};

		it("should throw error 'path is not a valid path' if path is invalid", async () => {
			const dto = FileUploadDto.from('../test/t.txt', file);
			const error = new ServerError('path must be a valid file path', HttpStatus.BAD_REQUEST);

			await expect(service.upload(dto)).rejects.toStrictEqual(error);
		});

		it("should throw error 'file already exists' if overwrite is false and file already exists in db", async () => {
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(true);

			const dto = FileUploadDto.from('test/test.txt', file);
			const error = new ServerError('file at test/test.txt already exists', HttpStatus.CONFLICT);

			await expect(service.upload(dto, false)).rejects.toStrictEqual(error);
		});

		it('should save file in db and write to disk if overwrite is false and file does not already exist in db', async () => {
			const dto = FileUploadDto.from('test.txt', file);
			const response = new (FileUploadResponse as any)('test/testfile.txt');
			const joinedPath = 'testPath';

			const dbSaveResult = { fullPath: 'test/testfile.txt', getUuidAsDirPath: jest.fn().mockReturnValue('test') };

			const writeFileSpy = jest.spyOn(FileUtils, 'writeFile').mockImplementationOnce(null as any);
			const deleteSpy = jest.spyOn(mockedEntityManager, 'delete').mockImplementationOnce(null as any);
			const saveSpy = jest.spyOn(mockedEntityManager, 'save').mockResolvedValueOnce(dbSaveResult);

			jest.spyOn(FileUtils, 'join').mockReturnValueOnce(joinedPath);
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(null);

			await expect(service.upload(dto, false)).resolves.toStrictEqual(response);
			expect(deleteSpy).not.toHaveBeenCalled();
			expect(writeFileSpy).toHaveBeenCalledWith(joinedPath, file.buffer);
			expect(saveSpy).toHaveBeenCalledWith(File, dto.toFile());
		});

		it('should delete existing file from db, save new file in db and write to disk if overwrite is true and file does already exist in db', async () => {
			const dto = FileUploadDto.from('test.txt', file);
			const response = new (FileUploadResponse as any)('test/testfile.txt');
			const joinedPath = 'testPath';

			const existingFile = { uuid: 'testUuid' };
			const dbSaveResult = { fullPath: 'test/testfile.txt', getUuidAsDirPath: jest.fn().mockReturnValue('test') };

			const writeFileSpy = jest.spyOn(FileUtils, 'writeFile').mockImplementationOnce(null as any);
			const deleteSpy = jest.spyOn(mockedEntityManager, 'delete').mockImplementationOnce(null as any);
			const saveSpy = jest.spyOn(mockedEntityManager, 'save').mockResolvedValueOnce(dbSaveResult);

			jest.spyOn(FileUtils, 'join').mockReturnValueOnce(joinedPath);
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(existingFile);

			await expect(service.upload(dto, true)).resolves.toStrictEqual(response);
			expect(deleteSpy).toHaveBeenCalledWith(File, { uuid: existingFile.uuid });
			expect(writeFileSpy).toHaveBeenCalledWith(joinedPath, file.buffer);
			expect(saveSpy).toHaveBeenCalledWith(File, dto.toFile());
		});

		it('should save file in db and write to disk if overwrite is true and file does not already exist in db', async () => {
			const dto = FileUploadDto.from('test.txt', file);
			const response = new (FileUploadResponse as any)('test/testfile.txt');
			const joinedPath = 'testPath';

			const dbSaveResult = { fullPath: 'test/testfile.txt', getUuidAsDirPath: jest.fn().mockReturnValue('test') };

			const writeFileSpy = jest.spyOn(FileUtils, 'writeFile').mockImplementationOnce(null as any);
			const deleteSpy = jest.spyOn(mockedEntityManager, 'delete').mockImplementationOnce(null as any);
			const saveSpy = jest.spyOn(mockedEntityManager, 'save').mockResolvedValueOnce(dbSaveResult);

			jest.spyOn(FileUtils, 'join').mockReturnValueOnce(joinedPath);
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(null);

			await expect(service.upload(dto, true)).resolves.toStrictEqual(response);
			expect(deleteSpy).not.toHaveBeenCalled();
			expect(writeFileSpy).toHaveBeenCalledWith(joinedPath, file.buffer);
			expect(saveSpy).toHaveBeenCalledWith(File, dto.toFile());
		});
	});

	describe('metadata', () => {
		it("should throw error 'file does not exist'", async () => {
			const dto: FileMetadataDto = new (FileMetadataDto as any)('test/t.txt');
			const error = new ServerError(`file at ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(null);

			await expect(service.metadata(dto)).rejects.toStrictEqual(error);
		});

		it('should return file metadata', async () => {
			const dto: FileMetadataDto = new (FileMetadataDto as any)('');
			const response = new (FileMetadataResponse as any)('', '', '', '', '', 0, new Date(), new Date());

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValue(response);

			await expect(service.metadata(dto)).resolves.toStrictEqual(response);
		});
	});

	describe('download', () => {
		it("should throw error 'file does not exist' in db layer", async () => {
			const dto: FileDownloadDto = new (FileDownloadDto as any)('test/test.txt');
			const error = new ServerError(`file at ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(null);

			await expect(service.download(dto)).rejects.toStrictEqual(error);
		});

		it("should throw error 'file does not exist' in fs layer", async () => {
			const dto: FileDownloadDto = new (FileDownloadDto as any)('test/test.txt');
			const error = new ServerError(`file at ${dto.path} does not exist`, HttpStatus.NOT_FOUND);
			const joinedPath = 'testPath';

			const dbFindResult = {
				getUuidAsDirPath: jest.fn().mockReturnValue('testPath'),
			};

			jest.spyOn(FileUtils, 'join').mockReturnValueOnce(joinedPath);
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(dbFindResult);
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValueOnce(false);

			await expect(service.download(dto)).rejects.toStrictEqual(error);
		});

		it('should return response', async () => {
			const joined = 'testPath';
			const stream = 'testStream' as any;
			const dbFindResult = { getUuidAsDirPath: jest.fn().mockReturnValue(''), name: 'test.txt', mimeType: 'mimeTest' };

			const dto: FileDownloadDto = new (FileDownloadDto as any)('');
			const response = FileDownloadResponse.from(dbFindResult.name, dbFindResult.mimeType, stream);

			const readStreamSpy = jest.spyOn(fs, 'createReadStream').mockReturnValueOnce(stream);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(dbFindResult);
			jest.spyOn(FileUtils, 'join').mockReturnValueOnce(joined);
			jest.spyOn(FileUtils, 'pathExists').mockResolvedValueOnce(true);

			await expect(service.download(dto)).resolves.toStrictEqual(response);
			expect(readStreamSpy).toHaveBeenCalledWith(joined);
		});
	});

	describe('delete', () => {
		it("should throw error 'file does not exist'", async () => {
			const dto: FileDeleteDto = new (FileDeleteDto as any)('test/path.txt');
			const error = new ServerError(`file at ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(null);

			await expect(service.delete(dto)).rejects.toStrictEqual(error);
		});

		it('should update file recycle status in db and copy data to recycle location', async () => {
			const uuid = 'testUuid';
			const dto: FileDeleteDto = new (FileDeleteDto as any)();
			const response = new (FileDeleteResponse as any)(uuid);

			const dbFindResult = { uuid: uuid, getUuidAsDirPath: jest.fn().mockReturnValue('testPath') };

			const updateSpy = jest.spyOn(mockedEntityManager, 'update').mockImplementationOnce(null as any);
			const copySpy = jest.spyOn(FileUtils, 'copyFile').mockImplementationOnce(null as any);
			const rmSpy = jest.spyOn(fsPromises, 'rm').mockImplementationOnce(null as any);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(dbFindResult);
			jest.spyOn(FileUtils, 'join').mockReturnValueOnce('source').mockReturnValueOnce('dest');

			await expect(service.delete(dto)).resolves.toStrictEqual(response);
			expect(updateSpy).toHaveBeenCalledWith(File, { uuid: dbFindResult.uuid }, { isRecycled: true });
			expect(copySpy).toHaveBeenCalledWith('source', 'dest');
			expect(rmSpy).toHaveBeenCalledWith('source');
		});
	});

	describe('restore', () => {
		it("should throw error 'uuid does not exist'", async () => {
			const dto: FileRestoreDto = new (FileRestoreDto as any)('testUuid');
			const error = new ServerError(`uuid ${dto.uuid} does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(null);

			await expect(service.restore(dto)).rejects.toStrictEqual(error);
		});

		it("should throw error 'file already exists' if overwrite is false and there is already a file at the destination", async () => {
			const dbFindResult = { fullPath: 'testFullPath' };

			const dto: FileRestoreDto = new (FileRestoreDto as any)('testUuid');
			const error = new ServerError(`file at ${dbFindResult.fullPath} already exists`, HttpStatus.CONFLICT);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(dbFindResult).mockResolvedValueOnce(true);

			await expect(service.restore(dto, false)).rejects.toStrictEqual(error);
		});

		it('should delete existing file from db, update file in db and copy back to original location if overwrite is true and file exists at destination', async () => {
			const dbFindResult = { fullPath: 'fullPath', uuid: 'testUuidSource', getUuidAsDirPath: jest.fn().mockReturnValue('') };
			const dbFindExistingResult = { uuid: 'testUuidDest' };

			const dto: FileRestoreDto = new (FileRestoreDto as any)('');
			const response = new (FileRestoreResponse as any)(dbFindResult.fullPath);

			const deleteSpy = jest.spyOn(mockedEntityManager, 'delete').mockImplementationOnce(null as any);
			const updateSpy = jest.spyOn(mockedEntityManager, 'update').mockImplementationOnce(null as any);
			const copySpy = jest.spyOn(FileUtils, 'copyFile').mockImplementationOnce(null as any);
			const rmSpy = jest.spyOn(fsPromises, 'rm').mockImplementationOnce(null as any);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(dbFindResult).mockResolvedValueOnce(dbFindExistingResult);
			jest.spyOn(FileUtils, 'join').mockReturnValueOnce('source').mockReturnValueOnce('dest');

			await expect(service.restore(dto, true)).resolves.toStrictEqual(response);
			expect(deleteSpy).toHaveBeenCalledWith(File, { uuid: dbFindExistingResult.uuid });
			expect(updateSpy).toHaveBeenCalledWith(File, { uuid: dbFindResult.uuid }, { isRecycled: false });
			expect(copySpy).toHaveBeenCalledWith('source', 'dest');
			expect(rmSpy).toHaveBeenCalledWith('source');
		});

		it('should update file in db and copy back to original location if overwrite is true and no file at destination', async () => {
			const dbFindResult = { fullPath: 'fullPath', uuid: 'testUuidSource', getUuidAsDirPath: jest.fn().mockReturnValue('') };

			const dto: FileRestoreDto = new (FileRestoreDto as any)('');
			const response = new (FileRestoreResponse as any)(dbFindResult.fullPath);

			const deleteSpy = jest.spyOn(mockedEntityManager, 'delete').mockImplementationOnce(null as any);
			const updateSpy = jest.spyOn(mockedEntityManager, 'update').mockImplementationOnce(null as any);
			const copySpy = jest.spyOn(FileUtils, 'copyFile').mockImplementationOnce(null as any);
			const rmSpy = jest.spyOn(fsPromises, 'rm').mockImplementationOnce(null as any);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(dbFindResult).mockResolvedValueOnce(null);
			jest.spyOn(FileUtils, 'join').mockReturnValueOnce('source').mockReturnValueOnce('dest');

			await expect(service.restore(dto, true)).resolves.toStrictEqual(response);
			expect(deleteSpy).not.toHaveBeenCalled();
			expect(updateSpy).toHaveBeenCalledWith(File, { uuid: dbFindResult.uuid }, { isRecycled: false });
			expect(copySpy).toHaveBeenCalledWith('source', 'dest');
			expect(rmSpy).toHaveBeenCalledWith('source');
		});

		it('should update file in db and copy back to original location if overwrite is false and no file at destination', async () => {
			const dbFindResult = { fullPath: 'fullPath', uuid: 'testUuidSource', getUuidAsDirPath: jest.fn().mockReturnValue('') };

			const dto: FileRestoreDto = new (FileRestoreDto as any)('');
			const response = new (FileRestoreResponse as any)(dbFindResult.fullPath);

			const deleteSpy = jest.spyOn(mockedEntityManager, 'delete').mockImplementationOnce(null as any);
			const updateSpy = jest.spyOn(mockedEntityManager, 'update').mockImplementationOnce(null as any);
			const copySpy = jest.spyOn(FileUtils, 'copyFile').mockImplementationOnce(null as any);
			const rmSpy = jest.spyOn(fsPromises, 'rm').mockImplementationOnce(null as any);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(dbFindResult).mockResolvedValueOnce(null);
			jest.spyOn(FileUtils, 'join').mockReturnValueOnce('source').mockReturnValueOnce('dest');

			await expect(service.restore(dto, false)).resolves.toStrictEqual(response);
			expect(deleteSpy).not.toHaveBeenCalled();
			expect(updateSpy).toHaveBeenCalledWith(File, { uuid: dbFindResult.uuid }, { isRecycled: false });
			expect(copySpy).toHaveBeenCalledWith('source', 'dest');
			expect(rmSpy).toHaveBeenCalledWith('source');
		});
	});

	describe('rename', () => {
		it("should throw error 'file does not exist'", async () => {
			const dto: FileRenameDto = new (FileRenameDto as any)('sourcePath', 'destPath');
			const error = new ServerError(`file at ${dto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(null);

			await expect(service.rename(dto)).rejects.toStrictEqual(error);
		});

		it("should throw error 'file already exists' if overwrite is false and a file at the destination already exists", async () => {
			const dto: FileRenameDto = new (FileRenameDto as any)('sourcePath', 'destPath');
			const error = new ServerError(`file at ${dto.destinationPath} already exists`, HttpStatus.CONFLICT);

			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(true).mockResolvedValueOnce(true);

			await expect(service.rename(dto, false)).rejects.toStrictEqual(error);
		});

		it('should delete existing file from db and save new file in db if overwrite is true and file at destination already exists', async () => {
			const dbFindResult = { uuid: 'testUuid1', size: 11, getUuidAsDirPath: jest.fn().mockReturnValue('testPath') };
			const dbFindExistingResult = { uuid: 'testUuid2' };
			const dbSaveResult = { fullPath: 'testPath', getUuidAsDirPath: jest.fn().mockReturnValue('test') };

			const dto: FileRenameDto = new (FileRenameDto as any)('sourcePath', 'destPath/test/file.txt');
			const response: FileRenameResponse = FileRenameResponse.from(dbSaveResult as any);

			const dbSaveParam = new File(
				dto.destinationPath,
				'file.txt',
				'destPath/test',
				'text/plain',
				dbFindResult.size,
				false,
				dbFindResult.uuid
			);

			const deleteSpy = jest.spyOn(mockedEntityManager, 'delete').mockImplementationOnce(null as any);
			const saveSpy = jest.spyOn(mockedEntityManager, 'save').mockResolvedValueOnce(dbSaveResult);

			jest.spyOn(FileUtils, 'join').mockReturnValueOnce('sourcePath').mockReturnValueOnce('destPath');
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(dbFindResult).mockResolvedValueOnce(dbFindExistingResult);

			await expect(service.rename(dto, true)).resolves.toStrictEqual(response);
			expect(deleteSpy).toHaveBeenCalledWith(File, { uuid: dbFindExistingResult.uuid });
			expect(saveSpy).toHaveBeenCalledWith(File, dbSaveParam);
		});

		it('should update file in db if overwrite is true and no file at destination exists', async () => {
			const dbFindResult = { uuid: 'testUuid1', size: 19, getUuidAsDirPath: jest.fn().mockReturnValue('testPath') };
			const dbSaveResult = { fullPath: 'testPath', getUuidAsDirPath: jest.fn().mockReturnValue('test') };

			const dto: FileRenameDto = new (FileRenameDto as any)('sourcePath', 'destPath/test/file.txt');
			const response: FileRenameResponse = FileRenameResponse.from(dbSaveResult as any);

			const dbSaveParam = new File(
				dto.destinationPath,
				'file.txt',
				'destPath/test',
				'text/plain',
				dbFindResult.size,
				false,
				dbFindResult.uuid
			);

			const deleteSpy = jest.spyOn(mockedEntityManager, 'delete').mockImplementationOnce(null as any);
			const saveSpy = jest.spyOn(mockedEntityManager, 'save').mockResolvedValueOnce(dbSaveResult);

			jest.spyOn(FileUtils, 'join').mockReturnValueOnce('sourcePath').mockReturnValueOnce('destPath');
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(dbFindResult).mockResolvedValueOnce(null);

			await expect(service.rename(dto, true)).resolves.toStrictEqual(response);
			expect(deleteSpy).not.toHaveBeenCalled();
			expect(saveSpy).toHaveBeenCalledWith(File, dbSaveParam);
		});

		it('should update file in db if overwrite is false and no file at destination exists', async () => {
			const dbFindResult = { uuid: 'testUuid1', size: 19, getUuidAsDirPath: jest.fn().mockReturnValue('testPath') };
			const dbSaveResult = { fullPath: 'testPath', getUuidAsDirPath: jest.fn().mockReturnValue('test') };

			const dto: FileRenameDto = new (FileRenameDto as any)('sourcePath', 'destPath/test/file.txt');
			const response: FileRenameResponse = FileRenameResponse.from(dbSaveResult as any);

			const dbSaveParam = new File(
				dto.destinationPath,
				'file.txt',
				'destPath/test',
				'text/plain',
				dbFindResult.size,
				false,
				dbFindResult.uuid
			);

			const deleteSpy = jest.spyOn(mockedEntityManager, 'delete').mockImplementationOnce(null as any);
			const saveSpy = jest.spyOn(mockedEntityManager, 'save').mockResolvedValueOnce(dbSaveResult);

			jest.spyOn(FileUtils, 'join').mockReturnValueOnce('sourcePath').mockReturnValueOnce('destPath');
			jest.spyOn(mockedEntityManager, 'findOne').mockResolvedValueOnce(dbFindResult).mockResolvedValueOnce(null);

			await expect(service.rename(dto, false)).resolves.toStrictEqual(response);
			expect(deleteSpy).not.toHaveBeenCalled();
			expect(saveSpy).toHaveBeenCalledWith(File, dbSaveParam);
		});
	});
});
