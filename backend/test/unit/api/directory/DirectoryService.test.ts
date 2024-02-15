import { EntityManager } from '@mikro-orm/mariadb';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectoryService } from 'src/api/directory/DirectoryService';
import { IDirectoryRepository } from 'src/api/directory/IDirectoryRepository';
import { IDirectoryService } from 'src/api/directory/IDirectoryService';
import { DirectoryContentResponse } from 'src/api/directory/mapping/content';
import { DirectoryCreateResponse } from 'src/api/directory/mapping/create';
import { DirectoryDeleteResponse } from 'src/api/directory/mapping/delete';
import { DirectoryDownloadResponse } from 'src/api/directory/mapping/download';
import { DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata';
import { DirectoryRenameResponse } from 'src/api/directory/mapping/rename';
import { DirectoryRestoreResponse } from 'src/api/directory/mapping/restore';
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
						selectByUuid: jest.fn(),
						exists: jest.fn(),
						restore: jest.fn(),
						softDelete: jest.fn(),
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

	describe('content', () => {
		it('should throw 404 NOT FOUND if directory does not exist', async () => {
			jest.spyOn(repository, 'getContent').mockResolvedValueOnce(null);

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
			jest.spyOn(repository, 'selectByPath').mockResolvedValueOnce(null);

			const dto = { path: 'test/path' };
			const expectedError = new ServerError(`directory ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

			await expect(service.download(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should resolve with the correct response', async () => {
			const dbDirectoryResponse = { id: 'uuid', name: 'dirName' };
			const dbFilesResponse = [{ id: 'uuid1', path: 'test/path1.txt' }];
			const zipArchive = 'zipArchive';
			const dto = { path: 'test/path' };

			jest.spyOn(repository, 'selectByPath').mockResolvedValueOnce(dbDirectoryResponse);
			jest.spyOn(repository, 'getFilesRelative').mockResolvedValueOnce(dbFilesResponse);
			jest.spyOn(FileUtils, 'createZIPArchive').mockResolvedValueOnce(zipArchive as any);

			await expect(service.download(dto)).resolves.toStrictEqual(
				DirectoryDownloadResponse.from('dirName.zip', 'application/zip', zipArchive as any)
			);
		});
	});

	describe('restore', () => {
		it('should throw 404 NOT FOUND if directory does not exist', async () => {
			jest.spyOn(repository, 'selectByUuid').mockResolvedValueOnce(null);

			const dto = { id: 'uuid' };
			const expectedError = new ServerError(`directory with id ${dto.id} does not exist`, HttpStatus.NOT_FOUND);

			await expect(service.restore(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should throw 409 CONFLICT if a directory at that path already exists', async () => {
			const dbDirectoryResult = { path: 'test/path' };
			const expectedError = new ServerError(`directory ${dbDirectoryResult.path} already exists`, HttpStatus.CONFLICT);
			const dto = { id: 'uuid' };

			jest.spyOn(repository, 'selectByUuid').mockResolvedValueOnce(dbDirectoryResult);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.restore(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should resolve with correct response', async () => {
			const dbDirectoryResult = { path: 'test/path' };
			const dto = { id: 'uuid' };

			jest.spyOn(repository, 'selectByUuid').mockResolvedValueOnce(dbDirectoryResult);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);

			await expect(service.restore(dto)).resolves.toStrictEqual(DirectoryRestoreResponse.from(dbDirectoryResult.path));
			expect(repository.restore).toHaveBeenCalledWith(entityManager, dto.id);
		});
	});

	describe('create', () => {
		it('should throw 404 NOT FOUND if the parent directory does not exist and the parent directory is not the root directory', async () => {
			const dto = { path: 'test/path' };
			const expectedError = new ServerError(`directory test does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'selectByPath').mockResolvedValueOnce(null);

			await expect(service.create(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should throw 409 CONFLICT if directory at that path already exists', async () => {
			const dto = { path: 'test/path' };
			const expectedError = new ServerError(`directory ${dto.path} already exists`, HttpStatus.CONFLICT);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.create(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should insert with the parent id from the db response and resolve with the correct response', async () => {
			const dto = { path: 'test/path' };
			const parent = { id: 'parentId', name: 'name' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'selectByPath').mockResolvedValueOnce(parent);

			await expect(service.create(dto)).resolves.toStrictEqual(DirectoryCreateResponse.from(dto.path));
			expect(repository.insert).toHaveBeenCalledWith(entityManager, 'path', parent.id);
		});

		it('should insert with null as parent id and resolve with the correct response', async () => {
			const dto = { path: 'newDirectory' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'selectByPath').mockResolvedValueOnce(null);

			await expect(service.create(dto)).resolves.toStrictEqual(DirectoryCreateResponse.from(dto.path));
			expect(repository.insert).toHaveBeenCalledWith(entityManager, 'newDirectory', null);
		});
	});

	describe('rename', () => {
		it('should throw 404 NOT FOUND if the directory to rename does not exist', async () => {
			const dto = { sourcePath: 'source/path', destPath: 'dest/path' };
			const expectedError = new ServerError(`directory ${dto.sourcePath} does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should throw 404 NOT FOUND if the parent of source and destination is different and the destination parent does not exist', async () => {
			const dto = { sourcePath: 'source/path', destPath: 'dest/path' };
			const expectedError = new ServerError(`directory dest does not exist`, HttpStatus.NOT_FOUND);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should throw 409 CONFLICT if directory at the destination path already exists', async () => {
			const dto = { sourcePath: 'source/path', destPath: 'dest/path' };
			const expectedError = new ServerError(`directory ${dto.destPath} already exists`, HttpStatus.CONFLICT);

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should update the name of the directory if the parent of source and destination is the same and resolve with the correct response', async () => {
			const dto = { sourcePath: 'photos/work', destPath: 'photos/vacation' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto));
			expect(repository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { name: 'vacation' });
		});

		it('should update the name and the parent of the directory if the parent of source and destination is different and resolve with the correct response', async () => {
			const dto = { sourcePath: 'photos/work', destPath: 'photos/vacation/mine' };
			const dbDestParent = { name: 'vacation', id: 'uuid' };

			jest.spyOn(repository, 'exists').mockResolvedValueOnce(false);
			jest.spyOn(repository, 'exists').mockResolvedValueOnce(true);
			jest.spyOn(repository, 'selectByPath').mockResolvedValueOnce(dbDestParent);
			jest.spyOn(entityManager, 'getReference').mockReturnValueOnce('parent' as any);

			await expect(service.rename(dto)).resolves.toStrictEqual(DirectoryRenameResponse.from(dto));
			expect(repository.update).toHaveBeenCalledWith(entityManager, dto.sourcePath, { name: 'mine', parent: 'parent' });
		});
	});

	describe('delete', () => {
		it('should throw 404 NOT FOUND if directory does not exist', async () => {
			jest.spyOn(repository, 'selectByPath').mockResolvedValueOnce(null);

			const dto = { path: 'test/path' };
			const expectedError = new ServerError(`directory ${dto.path} does not exist`, HttpStatus.NOT_FOUND);

			await expect(service.delete(dto)).rejects.toStrictEqual(expectedError);
		});

		it('should resolve with the correct response', async () => {
			const dbResult = { name: 'name', id: 'uuid' };
			const dto = { path: 'test/path' };

			jest.spyOn(repository, 'selectByPath').mockResolvedValueOnce(dbResult);

			await expect(service.delete(dto)).resolves.toStrictEqual(DirectoryDeleteResponse.from(dbResult.id));
			expect(repository.softDelete).toHaveBeenCalledWith(entityManager, dbResult.id);
		});
	});
});
