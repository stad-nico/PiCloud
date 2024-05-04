import { EntityManager } from '@mikro-orm/mariadb';
import { HttpStatus } from '@nestjs/common';
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
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';

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
			const expectedError = new ServerError(`directory test does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(null);

			await expect(service.create(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.insert).not.toHaveBeenCalled();
		});

		it('should throw 409 CONFLICT if directory at that path already exists', async () => {
			const dto = { path: 'test/path' };
			const expectedError = new ServerError(`directory ${dto.path} already exists`, HttpStatus.CONFLICT);

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
			const expectedError = new ServerError(`directory ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

			await expect(service.content(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should resolve with the correct response', async () => {
			const dbResult = {
				files: [{ name: 'name', mimeType: 'text/plain', size: 19, updatedAt: new Date(), createdAt: new Date() }],
				directories: [{ name: 'name', size: 129, updatedAt: new Date(), createdAt: new Date() }],
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
			const expectedError = new ServerError(`directory ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

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
			const expectedError = new ServerError(`directory ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

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
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const expectedError = new ServerError(`directory ${dto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.update).not.toHaveBeenCalled();
		});

		it('should throw 404 NOT FOUND if destination parent is different but does not exist and it is not the root directory', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const expectedError = new ServerError(`directory destination does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(null);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.update).not.toHaveBeenCalled();
		});

		it('should throw 409 CONFLICT if directory already exists', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const expectedError = new ServerError(`directory ${dto.destinationPath} already exists`, HttpStatus.CONFLICT);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
			expect(repository.update).not.toHaveBeenCalled();
		});

		it('should not update anything if the name and parent are the same', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'source/path.txt' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto.destinationPath));
			expect(repository.update).not.toHaveBeenCalled();
		});

		it('should only update the name of the directory if the parent of source and destination is the same and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path1.txt', destinationPath: 'source/path2.txt' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto.destinationPath));
			expect(repository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { name: 'path2.txt' });
		});

		it('should only update the parentId of the directory if the name is the same and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path.txt' };
			const parent = { id: 'parentId', name: 'destination' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(parent);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto.destinationPath));
			expect(repository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { parentId: parent.id });
		});

		it('should only update the parent of the directory with null if the name is the same and the destination parent is the root directory and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'path.txt' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(null);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto.destinationPath));
			expect(repository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { parentId: 'root' });
		});

		it('should update name and parent of the directory and resolve with the correct response', async () => {
			const dto = { sourcePath: 'source/path.txt', destinationPath: 'destination/path2.txt' };
			const parent = { id: 'uuid', name: 'destination' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(repository, 'select').mockResolvedValueOnce(parent);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto.destinationPath));
			expect(repository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { name: 'path2.txt', parentId: parent.id });
		});
	});

	describe('delete', () => {
		it('should throw 404 NOT FOUND if directory does not exist', async () => {
			jest.spyOn(repository, 'select').mockResolvedValueOnce(null);

			const dto = { path: 'test/path' };
			const expectedError = new ServerError(`directory ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

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
