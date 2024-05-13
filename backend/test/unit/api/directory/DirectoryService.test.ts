import * as path from 'path';

import { EntityManager } from '@mikro-orm/mariadb';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { DirectoryService } from 'src/api/directory/DirectoryService';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { IDirectoryService } from 'src/api/directory/IDirectoryService';
import { DirectoryContentResponse } from 'src/api/directory/mapping/content';
import { DirectoryCreateResponse } from 'src/api/directory/mapping/create';
import { DirectoryDownloadResponse } from 'src/api/directory/mapping/download';
import { DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata';
import { DirectoryRenameResponse } from 'src/api/directory/mapping/rename';
import { DirectoryAlreadyExistsException } from 'src/exceptions/DirectoryAlreadyExistsException';
import { DirectoryNotFoundException } from 'src/exceptions/DirectoryNotFoundException';
import { ParentDirectoryNotFoundException } from 'src/exceptions/ParentDirectoryNotFoundExceptions';
import { FileUtils } from 'src/util/FileUtils';

describe('DirectoryService', () => {
	let service: IDirectoryService;
	let repository: IDirectoryRepository;
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
						getContent: jest.fn(),
						getMetadata: jest.fn(),
						selectByPath: jest.fn(),
						getFilesRelative: jest.fn(),
						select: jest.fn(),
						exists: jest.fn(),
						delete: jest.fn(),
						insert: jest.fn(),
						update: jest.fn(),
					},
				},
				{
					provide: IDirectoryService,
					useClass: DirectoryService,
				},
			],
		}).compile();

		service = module.get(IDirectoryService);
		repository = module.get(IDirectoryRepository);
		entityManager = module.get(EntityManager);
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('create', () => {
		it('should throw 404 NOT FOUND if the parent directory does not exist and the parent directory is not the root directory', async () => {
			const dto = { path: 'test/path' };
			const expectedError = new ParentDirectoryNotFoundException(path.dirname(dto.path));

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(null);

			await expect(service.create(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.insert).not.toHaveBeenCalled();
		});

		it('should throw 409 CONFLICT if directory at that path already exists', async () => {
			const dto = { path: 'test/path' };
			const expectedError = new DirectoryAlreadyExistsException(dto.path);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.create(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.insert).not.toHaveBeenCalled();
		});

		it('should insert with the parent id from the db response and resolve with the correct response', async () => {
			const dto = { path: 'test/path' };
			const parent = { id: 'parentId', name: 'name' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(parent);

			await expect(service.create(dto)).resolves.toStrictEqual(DirectoryCreateResponse.from(dto.path));
			expect(repository.insert).toHaveBeenCalledWith(entityManager, 'path', parent.id);
		});

		it('should insert with null as parent id and resolve with the correct response', async () => {
			const dto = { path: 'newDirectory' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(null);

			await expect(service.create(dto)).resolves.toStrictEqual(DirectoryCreateResponse.from(dto.path));
			expect(repository.insert).toHaveBeenCalledWith(entityManager, 'newDirectory', 'root');
		});
	});

	describe('content', () => {
		it('should throw 404 NOT FOUND if directory does not exist', async () => {
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);

			const dto = { path: 'test/path' };
			const expectedError = new DirectoryNotFoundException(dto.path);

			await expect(service.content(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should resolve with the correct response', async () => {
			const dbResult = {
				files: [{ name: 'name', mimeType: 'text/plain', size: 19, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() }],
				directories: [{ name: 'name', size: 129, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString() }],
			};
			const dto = { path: 'test/path' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(repository, 'getContent').mockResolvedValueOnce(dbResult);

			await expect(service.content(dto)).resolves.toStrictEqual(DirectoryContentResponse.from(dbResult));
		});
	});

	describe('metadata', () => {
		it('should throw 404 NOT FOUND if directory does not exist', async () => {
			jest.spyOn(repository, 'getMetadata').mockResolvedValueOnce(null);

			const dto = { path: 'test/path' };
			const expectedError = new DirectoryNotFoundException(dto.path);

			await expect(service.metadata(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should resolve with the correct response', async () => {
			const dbResult = {
				id: 'uuid',
				name: 'path',
				size: 10,
				files: 11,
				directories: 12,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			const dto = { path: 'test/path' };

			jest.spyOn(repository, 'getMetadata').mockResolvedValueOnce(dbResult);

			await expect(service.metadata(dto)).resolves.toStrictEqual(DirectoryMetadataResponse.from({ path: dto.path, ...dbResult }));
		});
	});

	describe('download', () => {
		it('should throw 404 NOT FOUND if directory does not exist', async () => {
			jest.spyOn(repository, 'select').mockResolvedValueOnce(null);

			const dto = { path: 'test/path' };
			const expectedError = new DirectoryNotFoundException(dto.path);

			await expect(service.download(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.getFilesRelative).not.toHaveBeenCalled();
		});

		it('should resolve with the correct response', async () => {
			const dbDirectoryResponse = { id: 'uuid', name: 'dirName' };
			const dbFilesResponse = [{ id: 'uuid1', path: 'test/path1.txt' }];
			const zipArchive = 'zipArchive';
			const dto = { path: 'test/path' };

			jest.spyOn(repository, 'select').mockResolvedValueOnce(dbDirectoryResponse);
			jest.spyOn(repository, 'getFilesRelative').mockResolvedValueOnce(dbFilesResponse);
			jest.spyOn(FileUtils, 'createZIPArchive').mockResolvedValueOnce(zipArchive as any);

			await expect(service.download(dto)).resolves.toStrictEqual(DirectoryDownloadResponse.from('dirName.zip', 'application/zip', zipArchive as any));
		});
	});

	describe('rename', () => {
		it('should throw 404 NOT FOUND if directory does not exist', async () => {
			const dto = { sourcePath: 'source/path', destinationPath: 'destination/path' };
			const expectedError = new DirectoryNotFoundException(dto.sourcePath);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.update).not.toHaveBeenCalled();
		});

		it('should throw 404 NOT FOUND if destination parent is different but does not exist and it is not the root directory', async () => {
			const dto = { sourcePath: 'source/path', destinationPath: 'destination/path' };
			const expectedError = new ParentDirectoryNotFoundException(path.dirname(dto.destinationPath));

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(null);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.update).not.toHaveBeenCalled();
		});

		it('should throw 409 CONFLICT if directory already exists', async () => {
			const dto = { sourcePath: 'source/path', destinationPath: 'destination/path' };
			const expectedError = new DirectoryAlreadyExistsException(dto.destinationPath);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.update).not.toHaveBeenCalled();
		});

		it('should not update anything if the name and parent are the same', async () => {
			const dto = { sourcePath: 'source/path', destinationPath: 'source/path' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto.destinationPath));
			expect(repository.update).not.toHaveBeenCalled();
		});

		it('should only update the name of the directory if the parent of source and destination is the same and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path1', destinationPath: 'source/path2' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto.destinationPath));
			expect(repository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { name: 'path2' });
		});

		it('should only update the parentId of the directory if the name is the same and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path', destinationPath: 'destination/path' };
			const parent = { id: 'parentId', name: 'destination' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(parent);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto.destinationPath));
			expect(repository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { parentId: parent.id });
		});

		it('should only update the parent of the directory with null if the name is the same and the destination parent is the root directory and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path', destinationPath: 'path' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(null);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto.destinationPath));
			expect(repository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { parentId: 'root' });
		});

		it('should update name and parent of the directory and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path', destinationPath: 'destination/path2' };
			const parent = { id: 'uuid', name: 'destination' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(parent);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto.destinationPath));
			expect(repository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { name: 'path2', parentId: parent.id });
		});
	});

	describe('delete', () => {
		it('should throw 404 NOT FOUND if directory does not exist', async () => {
			jest.spyOn(repository, 'select').mockResolvedValueOnce(null);

			const dto = { path: 'test/path' };
			const expectedError = new DirectoryNotFoundException(dto.path);

			await expect(service.delete(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.delete).not.toHaveBeenCalled();
		});

		it('should resolve with the correct response', async () => {
			const dbResult = { name: 'name', id: 'uuid' };
			const dto = { path: 'test/path' };

			jest.spyOn(repository, 'select').mockResolvedValueOnce(dbResult);

			await expect(service.delete(dto)).resolves.not.toThrow();
			expect(repository.delete).toHaveBeenCalledWith(entityManager, dbResult.id);
		});
	});
});
