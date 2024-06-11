import * as fs from 'fs';

import { EntityManager } from '@mikro-orm/mariadb';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { FileService } from 'src/api/file/FileService';
import { IFileRepository } from 'src/api/file/IFileRepository';
import { IFileService } from 'src/api/file/IFileService';
import { FileDownloadResponse } from 'src/api/file/mapping/download';
import { FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileRenameResponse } from 'src/api/file/mapping/rename';
import { FileReplaceResponse } from 'src/api/file/mapping/replace';
import { FileUploadResponse } from 'src/api/file/mapping/upload';
import { FileAlreadyExistsException } from 'src/exceptions/FileAlreadyExistsException';
import { FileNotFoundException } from 'src/exceptions/FileNotFoundException';
import { ParentDirectoryNotFoundException } from 'src/exceptions/ParentDirectoryNotFoundExceptions';
import { FileUtils } from 'src/util/FileUtils';
import { PathUtils } from 'src/util/PathUtils';

jest.mock('src/util/FileUtils', () => ({
	FileUtils: {
		writeFile: jest.fn(),
	},
}));

jest.mock('fs');

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
						select: jest.fn(),
					},
				},
				{
					provide: IFileRepository,
					useValue: {
						getMetadata: jest.fn(),
						select: jest.fn(),
						exists: jest.fn(),
						insertReturningId: jest.fn(),
						deleteById: jest.fn(),
						deleteByPath: jest.fn(),
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
			const expectedError = new FileNotFoundException(dto.path);

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
			jest.spyOn(fileRepository, 'select').mockResolvedValueOnce(null);

			const dto = { path: 'test/path.txt' };
			const expectedError = new FileNotFoundException(dto.path);

			await expect(service.download(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should resolve with the correct response', async () => {
			const dto = { path: 'test/path.txt' };
			const dbSelect = { id: 'uuid', name: 'path.txt', mimeType: 'text/plain' };
			const readStream = 'test';

			jest.spyOn(fileRepository, 'select').mockResolvedValueOnce(dbSelect);
			jest.spyOn(fs, 'createReadStream').mockReturnValueOnce(readStream as any);
			jest.spyOn(PathUtils, 'join').mockReturnValueOnce('fgf');

			await expect(service.download(dto)).resolves.toStrictEqual(FileDownloadResponse.from(dbSelect.name, dbSelect.mimeType, readStream as any));
		});
	});

	describe('upload', () => {
		it('should throw 404 NOT FOUND if the parent directory does not exist and the parent directory is not the root directory', async () => {
			const dto = { path: 'test/path' };
			const expectedError = new ParentDirectoryNotFoundException('test');

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(directoryRepository, 'select').mockResolvedValueOnce(null);

			await expect(service.upload(dto as any)).rejects.toStrictEqual(expectedError);
		});

		it('should throw 409 CONFLICT if file already exists', async () => {
			const dto = { path: 'test/path.txt' };
			const expectedError = new FileAlreadyExistsException(dto.path);

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);

			await expect(service.upload(dto as any)).rejects.toStrictEqual(expectedError);
		});

		it('should insert with the parent id from the db response and resolve with the correct response', async () => {
			const dto = { path: 'test/path.txt', mimeType: 'text/plain', size: 19, buffer: Buffer.from('content') };
			const parent = { id: 'parentId', name: 'name' };
			const filePath = 'filePath';

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(directoryRepository, 'select').mockResolvedValueOnce(parent);
			jest.spyOn(fileRepository, 'insertReturningId').mockResolvedValueOnce({ id: 'uuid' });
			jest.spyOn(PathUtils, 'join').mockReturnValueOnce(filePath);

			await expect(service.upload(dto)).resolves.toStrictEqual(FileUploadResponse.from(dto.path));
			expect(fileRepository.insertReturningId).toHaveBeenCalledWith(entityManager, 'path.txt', dto.mimeType, dto.size, parent.id);
			expect(FileUtils.writeFile).toHaveBeenCalledWith(filePath, dto.buffer);
		});

		it('should insert with null as parent id and resolve with the correct response', async () => {
			const dto = { path: 'path.txt', mimeType: 'text/plain', size: 12, buffer: Buffer.from('content') };
			const filePath = 'filePath';

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(directoryRepository, 'select').mockResolvedValueOnce(null);
			jest.spyOn(fileRepository, 'insertReturningId').mockResolvedValueOnce({ id: 'uuid' });
			jest.spyOn(PathUtils, 'join').mockReturnValueOnce(filePath);

			await expect(service.upload(dto)).resolves.toStrictEqual(FileUploadResponse.from(dto.path));
			expect(fileRepository.insertReturningId).toHaveBeenCalledWith(entityManager, 'path.txt', dto.mimeType, dto.size, 'root');
			expect(FileUtils.writeFile).toHaveBeenCalledWith(filePath, dto.buffer);
		});
	});

	describe('replace', () => {
		it('should throw 404 NOT FOUND if the parent directory does not exist', async () => {
			const dto = { path: 'test/file.txt' };
			const expectedError = new ParentDirectoryNotFoundException('test');

			jest.spyOn(directoryRepository, 'select').mockResolvedValueOnce(null);

			await expect(service.replace(dto as any)).rejects.toStrictEqual(expectedError);
			expect(fileRepository.deleteByPath).not.toHaveBeenCalled();
			expect(fileRepository.insertReturningId).not.toHaveBeenCalled();
		});

		it('should insert and write new file and resolve with correct response', async () => {
			const dto = { path: 'test/file.txt', mimeType: 'text/plain', size: 11, buffer: Buffer.from('content') };
			const parent = { id: 'uuid' };
			const filePath = 'filePath';

			jest.spyOn(directoryRepository, 'select').mockResolvedValueOnce(parent as any);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'insertReturningId').mockResolvedValueOnce({ id: 'uuid' });
			jest.spyOn(PathUtils, 'join').mockReturnValueOnce(filePath);

			await expect(service.replace(dto)).resolves.toStrictEqual(FileReplaceResponse.from(dto.path));
			expect(FileUtils.writeFile).toHaveBeenCalledWith(filePath, dto.buffer);
			expect(fileRepository.deleteByPath).not.toHaveBeenCalled();
		});

		it('should delete old file from db, insert and write new file and resolve with correct response', async () => {
			const dto = { path: 'test/file.txt', mimeType: 'text/plain', size: 11, buffer: Buffer.from('content') };
			const parent = { id: 'uuid' };
			const filePath = 'filePath';

			jest.spyOn(directoryRepository, 'select').mockResolvedValueOnce(parent as any);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(fileRepository, 'insertReturningId').mockResolvedValueOnce({ id: 'uuid' });
			jest.spyOn(PathUtils, 'join').mockReturnValueOnce(filePath);

			await expect(service.replace(dto)).resolves.toStrictEqual(FileReplaceResponse.from(dto.path));
			expect(FileUtils.writeFile).toHaveBeenCalledWith(filePath, dto.buffer);
			expect(fileRepository.deleteByPath).toHaveBeenCalledWith(entityManager, dto.path);
		});
	});

	describe('rename', () => {
		it('should throw 404 NOT FOUND if file does not exist', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const expectedError = new FileNotFoundException(dto.sourcePath);

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(fileRepository.update).not.toHaveBeenCalled();
		});

		it('should throw 404 NOT FOUND if destination parent is different but does not exist and it is not the root directory', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const expectedError = new ParentDirectoryNotFoundException('destination');

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(fileRepository, 'select').mockResolvedValueOnce(null);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(fileRepository.update).not.toHaveBeenCalled();
		});

		it('should throw 409 CONFLICT if file already exists', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const expectedError = new FileAlreadyExistsException(dto.destinationPath);

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
			jest.spyOn(directoryRepository, 'select').mockResolvedValueOnce(parent);
			jest.spyOn(entityManager, 'getReference').mockReturnValueOnce(parent);

			await expect(service.rename(dto)).resolves.toStrictEqual(FileRenameResponse.from(dto.destinationPath));
			expect(fileRepository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { parentId: parent.id });
		});

		it('should only update the parent of the directory with null if the name is the same and the destination parent is the root directory and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'path.txt' };

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(directoryRepository, 'select').mockResolvedValueOnce(null);
			jest.spyOn(entityManager, 'getReference').mockReturnValueOnce(null as any);

			await expect(service.rename(dto)).resolves.toStrictEqual(FileRenameResponse.from(dto.destinationPath));
			expect(fileRepository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { parentId: 'root' });
		});

		it('should update name and parent of the directory and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path2.txt' };
			const parent = { id: 'uuid', name: 'destination' };

			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(fileRepository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(directoryRepository, 'select').mockResolvedValueOnce(parent);
			jest.spyOn(entityManager, 'getReference').mockReturnValueOnce(parent);

			await expect(service.rename(dto)).resolves.toStrictEqual(FileRenameResponse.from(dto.destinationPath));
			expect(fileRepository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { name: 'path2.txt', parentId: parent.id });
		});
	});

	describe('delete', () => {
		it('should throw 404 NOT FOUND if file does not exist', async () => {
			const dto = { path: 'test/file.txt' };
			const expectedError = new FileNotFoundException(dto.path);

			jest.spyOn(fileRepository, 'select').mockResolvedValueOnce(null);

			await expect(service.delete(dto)).rejects.toStrictEqual(expectedError);
			expect(fileRepository.deleteById).not.toHaveBeenCalled();
		});

		it('should resolve with correct response', async () => {
			const dto = { path: 'test/file.txt' };
			const dbFile = { id: 'uuid', name: 'file.txt', mimeType: 'text/plain' };

			jest.spyOn(fileRepository, 'select').mockResolvedValueOnce(dbFile);

			await expect(service.delete(dto)).resolves.not.toThrow();
			expect(fileRepository.deleteById).toHaveBeenCalledWith(entityManager, dbFile.id);
		});
	});
});
