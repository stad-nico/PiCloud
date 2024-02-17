import * as fs from 'fs';

import { EntityManager } from '@mikro-orm/mariadb';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { FileService } from 'src/api/file/FileService';
import { IFileRepository } from 'src/api/file/IFileRepository';
import { IFileService } from 'src/api/file/IFileService';
import { FileDeleteResponse } from 'src/api/file/mapping/delete';
import { FileDownloadResponse } from 'src/api/file/mapping/download';
import { FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileRenameResponse } from 'src/api/file/mapping/rename';
import { FileReplaceResponse } from 'src/api/file/mapping/replace';
import { FileRestoreResponse } from 'src/api/file/mapping/restore';
import { FileUploadResponse } from 'src/api/file/mapping/upload';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';
import { ServerError } from 'src/util/ServerError';

jest.mock('src/util/FileUtils', () => ({
	FileUtils: {
		writeFile: jest.fn(),
	},
}));

describe('FileService', () => {
	let service: IFileService;
	let fileRepository: IFileRepository;
	let directoryRepository: IDirectoryRepository;
	let entityManager: EntityManager;

	beforeAll(async () => {
		const mockedEntityManager = {
			getReference: jest.fn(),
			transactional: (callback: (em: unknown) => unknown) => callback(mockedEntityManager),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: EntityManager,
					useValue: mockedEntityManager,
				},
				{
					provide: ConfigService,
					useValue: {},
				},
				{
					provide: IDirectoryRepository,
					useValue: {
						selectByPath: jest.fn(),
					},
				},
				{
					provide: IFileRepository,
					useValue: {
						getMetadata: jest.fn(),
						selectByPath: jest.fn(),
						selectById: jest.fn(),
						exists: jest.fn(),
						restore: jest.fn(),
						insertReturningId: jest.fn(),
						softDelete: jest.fn(),
						hardDelete: jest.fn(),
						update: jest.fn(),
					},
				},
				{
					provide: IFileService,
					useClass: FileService,
				},
			],
		}).compile();

		service = module.get(IFileService);
		fileRepository = module.get(IFileRepository);
		directoryRepository = module.get(IDirectoryRepository);
		entityManager = module.get(EntityManager);
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('metadata', () => {
		it('should throw 404 NOT FOUND if file does not exist', async () => {
			jest.spyOn(fileRepository, 'getMetadata').mockResolvedValueOnce(null);

			const dto = { path: 'test/path.txt' };
			const expectedError = new ServerError(`file ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

			await expect(service.metadata(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should resolve with the correct response', async () => {
			const dto = { path: 'test/path.txt' };
			const dbMetadata = {
				id: 'uuid',
				name: 'path.txt',
				mimeType: 'text/plain',
				size: 129,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			jest.spyOn(fileRepository, 'getMetadata').mockResolvedValueOnce(dbMetadata);

			await expect(service.metadata(dto)).resolves.toStrictEqual(FileMetadataResponse.from({ path: dto.path, ...dbMetadata }));
		});
	});

	describe('download', () => {
		it('should throw 404 NOT FOUND if file does not exist', async () => {
			jest.spyOn(fileRepository, 'selectByPath').mockResolvedValueOnce(null);

			const dto = { path: 'test/path.txt' };
			const expectedError = new ServerError(`file ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

			await expect(service.download(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should resolve with the correct response', async () => {
			const dto = { path: 'test/path.txt' };
			const dbSelect = { id: 'uuid', name: 'path.txt', mimeType: 'text/plain' };
			const readStream = 'test';

			jest.spyOn(fileRepository, 'selectByPath').mockResolvedValueOnce(dbSelect);
			jest.spyOn(fs, 'createReadStream').mockReturnValueOnce(readStream as any);
			jest.spyOn(PathUtils, 'join').mockReturnValueOnce('fgf');

			await expect(service.download(dto)).resolves.toStrictEqual(
				FileDownloadResponse.from(dbSelect.name, dbSelect.mimeType, readStream as any)
			);
		});
	});

	describe('restore', () => {
		it('should throw 404 NOT FOUND if file does not exist', async () => {
			jest.spyOn(fileRepository, 'selectById').mockResolvedValueOnce(null);

			const dto = { id: 'uuid' };
			const expectedError = new ServerError(`file with id ${dto.id} does not exist`, HttpStatus.NOT_FOUND);

			await expect(service.restore(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should throw 409 CONFLICT if a file at that path already exists', async () => {
			const dbFileResult = { path: 'test/path' };
			const expectedError = new ServerError(`file ${dbFileResult.path} already exists`, HttpStatus.CONFLICT);
			const dto = { id: 'uuid' };

			jest.spyOn(fileRepository, 'selectById').mockResolvedValueOnce(dbFileResult);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);

			await expect(service.restore(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should resolve with correct response', async () => {
			const dbFileResult = { path: 'test/path' };
			const dto = { id: 'uuid' };

			jest.spyOn(fileRepository, 'selectById').mockResolvedValueOnce(dbFileResult);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);

			await expect(service.restore(dto)).resolves.toStrictEqual(FileRestoreResponse.from(dbFileResult.path));
			expect(fileRepository.restore).toHaveBeenCalledWith(entityManager, dto.id);
		});
	});

	describe('upload', () => {
		it('should throw 404 NOT FOUND if the parent directory does not exist and the parent directory is not the root directory', async () => {
			const dto = { path: 'test/path' };
			const expectedError = new ServerError(`directory test does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(directoryRepository, 'selectByPath').mockResolvedValueOnce(null);

			await expect(service.upload(dto as any)).rejects.toStrictEqual(expectedError);
		});

		it('should throw 409 CONFLICT if file already exists', async () => {
			const dto = { path: 'test/path.txt' };
			const expectedError = new ServerError(`file ${dto.path} already exists`, HttpStatus.CONFLICT);

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);

			await expect(service.upload(dto as any)).rejects.toStrictEqual(expectedError);
		});

		it('should insert with the parent id from the db response and resolve with the correct response', async () => {
			const dto = { path: 'test/path.txt', mimeType: 'text/plain', stream: 'stream' as any };
			const parent = { id: 'parentId', name: 'name' };
			const filePath = 'filePath';

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(directoryRepository, 'selectByPath').mockResolvedValueOnce(parent);
			jest.spyOn(fileRepository, 'insertReturningId').mockResolvedValueOnce({ id: 'uuid' });
			jest.spyOn(PathUtils, 'join').mockReturnValueOnce(filePath);

			await expect(service.upload(dto)).resolves.toStrictEqual(FileUploadResponse.from(dto.path));
			expect(fileRepository.insertReturningId).toHaveBeenCalledWith(entityManager, 'path.txt', dto.mimeType, parent.id);
			expect(FileUtils.writeFile).toHaveBeenCalledWith(filePath, dto.stream);
		});

		it('should insert with null as parent id and resolve with the correct response', async () => {
			const dto = { path: 'path.txt', mimeType: 'text/plain', stream: 'stream' as any };
			const filePath = 'filePath';

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(directoryRepository, 'selectByPath').mockResolvedValueOnce(null);
			jest.spyOn(fileRepository, 'insertReturningId').mockResolvedValueOnce({ id: 'uuid' });
			jest.spyOn(PathUtils, 'join').mockReturnValueOnce(filePath);

			await expect(service.upload(dto)).resolves.toStrictEqual(FileUploadResponse.from(dto.path));
			expect(fileRepository.insertReturningId).toHaveBeenCalledWith(entityManager, 'path.txt', dto.mimeType, null);
			expect(FileUtils.writeFile).toHaveBeenCalledWith(filePath, dto.stream);
		});
	});

	describe('replace', () => {
		it('should throw 404 NOT FOUND if the parent directory does not exist', async () => {
			const dto = { path: 'test/file.txt' };
			const expectedError = new ServerError(`directory test does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(directoryRepository, 'selectByPath').mockResolvedValueOnce(null);

			await expect(service.replace(dto as any)).rejects.toStrictEqual(expectedError);
			expect(fileRepository.hardDelete).not.toHaveBeenCalled();
			expect(fileRepository.insertReturningId).not.toHaveBeenCalled();
		});

		it('should insert and write new file and resolve with correct response', async () => {
			const dto = { path: 'test/file.txt', stream: 'stream' };
			const parent = { id: 'uuid' };
			const filePath = 'filePath';

			jest.spyOn(directoryRepository, 'selectByPath').mockResolvedValueOnce(parent as any);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'insertReturningId').mockResolvedValueOnce({ id: 'uuid' });
			jest.spyOn(PathUtils, 'join').mockReturnValueOnce(filePath);

			await expect(service.replace(dto as any)).resolves.toStrictEqual(FileReplaceResponse.from(dto.path));
			expect(FileUtils.writeFile).toHaveBeenCalledWith(filePath, dto.stream);
			expect(fileRepository.hardDelete).not.toHaveBeenCalled();
		});

		it('should delete old file from db, insert and write new file and resolve with correct response', async () => {
			const dto = { path: 'test/file.txt', stream: 'stream' };
			const parent = { id: 'uuid' };
			const filePath = 'filePath';

			jest.spyOn(directoryRepository, 'selectByPath').mockResolvedValueOnce(parent as any);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(fileRepository, 'insertReturningId').mockResolvedValueOnce({ id: 'uuid' });
			jest.spyOn(PathUtils, 'join').mockReturnValueOnce(filePath);

			await expect(service.replace(dto as any)).resolves.toStrictEqual(FileReplaceResponse.from(dto.path));
			expect(FileUtils.writeFile).toHaveBeenCalledWith(filePath, dto.stream);
			expect(fileRepository.hardDelete).toHaveBeenCalledWith(entityManager, dto.path, false);
		});
	});

	describe('rename', () => {
		it('should throw 404 NOT FOUND if file does not exist', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const expectedError = new ServerError(`file ${dto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(fileRepository.update).not.toHaveBeenCalled();
		});

		it('should throw 404 NOT FOUND if destination parent is different but does not exist and it is not the root directory', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const expectedError = new ServerError(`directory destination does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(fileRepository, 'selectByPath').mockResolvedValueOnce(null);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(fileRepository.update).not.toHaveBeenCalled();
		});

		it('should throw 409 CONFLICT if file already exists', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const expectedError = new ServerError(`file ${dto.destinationPath} already exists`, HttpStatus.CONFLICT);

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(fileRepository.update).not.toHaveBeenCalled();
		});

		it('should not update anything if the name and parent are the same', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'source/path.txt' };

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).resolves.toStrictEqual(FileRenameResponse.from(dto.destinationPath));
			expect(fileRepository.update).not.toHaveBeenCalled();
		});

		it('should only update the name of the directory if the parent of source and destination is the same and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path1.txt', destinationPath: 'source/path2.txt' };

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).resolves.toStrictEqual(FileRenameResponse.from(dto.destinationPath));
			expect(fileRepository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { name: 'path2.txt' });
		});

		it('should only update the parent of the directory if the name is the same and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const parent = { id: 'uuid', name: 'destination' };

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(directoryRepository, 'selectByPath').mockResolvedValueOnce(parent);
			jest.spyOn(entityManager, 'getReference').mockReturnValueOnce(parent);

			await expect(service.rename(dto)).resolves.toStrictEqual(FileRenameResponse.from(dto.destinationPath));
			expect(fileRepository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { parent: parent });
		});

		it('should only update the parent of the directory with null if the name is the same and the destination parent is the root directory and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'path.txt' };

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(directoryRepository, 'selectByPath').mockResolvedValueOnce(null);
			jest.spyOn(entityManager, 'getReference').mockReturnValueOnce(null as any);

			await expect(service.rename(dto)).resolves.toStrictEqual(FileRenameResponse.from(dto.destinationPath));
			expect(fileRepository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { parent: null });
		});

		it('should update name and parent of the directory and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path2.txt' };
			const parent = { id: 'uuid', name: 'destination' };

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(directoryRepository, 'selectByPath').mockResolvedValueOnce(parent);
			jest.spyOn(entityManager, 'getReference').mockReturnValueOnce(parent);

			await expect(service.rename(dto)).resolves.toStrictEqual(FileRenameResponse.from(dto.destinationPath));
			expect(fileRepository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { name: 'path2.txt', parent: parent });
		});
	});

	describe('delete', () => {
		it('should throw 404 NOT FOUND if file does not exist', async () => {
			const dto = { path: 'test/file.txt' };
			const expectedError = new ServerError(`file ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(fileRepository, 'selectByPath').mockResolvedValueOnce(null);

			await expect(service.delete(dto)).rejects.toStrictEqual(expectedError);
			expect(fileRepository.softDelete).not.toHaveBeenCalled();
		});

		it('should resolve with correct response', async () => {
			const dto = { path: 'test/file.txt' };
			const dbFile = { id: 'uuid', name: 'file.txt', mimeType: 'text/plain' };

			jest.spyOn(fileRepository, 'selectByPath').mockResolvedValueOnce(dbFile);

			await expect(service.delete(dto)).resolves.toStrictEqual(FileDeleteResponse.from(dbFile.id));
			expect(fileRepository.softDelete).toHaveBeenCalledWith(entityManager, dbFile.id);
		});
	});
});
