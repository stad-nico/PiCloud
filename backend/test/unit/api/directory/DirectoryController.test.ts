import { Test, TestingModule } from '@nestjs/testing';

import { DirectoryController } from 'src/modules/directories/directories.controller';
import { IDirectoryService } from 'src/modules/directories/IDirectoriesService';
import { DirectoryContentDto } from 'src/modules/directories/mapping/content';
import { DirectoryCreateDto } from 'src/modules/directories/mapping/create';
import { DirectoryDeleteDto } from 'src/modules/directories/mapping/delete';
import { DirectoryDownloadDto } from 'src/modules/directories/mapping/download';
import { DirectoryMetadataDto } from 'src/modules/directories/mapping/metadata';
import { DirectoryRenameDto } from 'src/modules/directories/mapping/rename';
import { DirectoryAlreadyExistsException } from 'src/modules/directories/exceptions/DirectoryAlreadyExistsException';
import { DirectoryNameTooLongException } from 'src/modules/directories/exceptions/DirectoryNameTooLongException';
import { DirectoryNotFoundException } from 'src/modules/directories/exceptions/DirectoryNotFoundException';
import { FileNotFoundException } from 'src/modules/files/exceptions/FileNotFoundException';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';

describe('DirectoryController', () => {
	let controller: DirectoryController;
	let service: IDirectoryService;

	beforeAll(async () => {
		const fileService: IDirectoryService = {
			content: jest.fn(),
			metadata: jest.fn(),
			download: jest.fn(),
			create: jest.fn(),
			rename: jest.fn(),
			delete: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [DirectoryController],
			providers: [
				{
					provide: IDirectoryService,
					useValue: fileService,
				},
			],
		}).compile();

		module.useLogger(false);

		controller = module.get(DirectoryController);
		service = module.get(IDirectoryService);
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('create', () => {
		it("should resolve with the response of the service if the file and the params are valid and the server doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'create').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryCreateDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.create(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the exception if params are invalid', async () => {
			const error = new DirectoryNameTooLongException('directory');

			jest.spyOn(service, 'create').mockResolvedValueOnce(0 as any);
			jest.spyOn(DirectoryCreateDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.create(0 as any)).rejects.toStrictEqual(error);
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new DirectoryAlreadyExistsException('directory');

			jest.spyOn(service, 'create').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryCreateDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.create(0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'create').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryCreateDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.create(0 as any)).rejects.toStrictEqual(error);
		});
	});

	describe('content', () => {
		it("should resolve with the response of the service if the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'content').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryContentDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.content(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new DirectoryNotFoundException('directory');

			jest.spyOn(service, 'content').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryContentDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.content(0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'content').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryContentDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.content(0 as any)).rejects.toStrictEqual(error);
		});
	});

	describe('metadata', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'metadata').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new DirectoryNotFoundException('directory');

			jest.spyOn(service, 'metadata').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'metadata').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).rejects.toStrictEqual(error);
		});
	});

	describe('download', () => {
		it("should resolve with the response of the service if the service doesn't throw", async () => {
			const response = { mimeType: 'text/plain', name: 'test', readable: Buffer.from('content') };
			const res = { header: jest.fn() };

			jest.spyOn(service, 'download').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryDownloadDto, 'from').mockReturnValueOnce(0 as any);

			expect((await controller.download(0 as any, res as any)).getStream().read()).toStrictEqual(response.readable);
			expect(res.header).toHaveBeenCalledWith({
				'Content-Type': response.mimeType,
				'Content-Disposition': `attachment; filename=${response.name}`,
			});
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new DirectoryNotFoundException('directory');

			jest.spyOn(service, 'download').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryDownloadDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.download(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'download').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryDownloadDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.download(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});
	});

	describe('rename', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'rename').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the exception if params are invalid', async () => {
			const error = new DirectoryNameTooLongException('nop');

			jest.spyOn(service, 'rename').mockResolvedValueOnce(0 as any);
			jest.spyOn(DirectoryRenameDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new FileNotFoundException('filename');

			jest.spyOn(service, 'rename').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'rename').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});
	});

	describe('delete', () => {
		it("should resolve if the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'delete').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).resolves.not.toThrow();
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new DirectoryNotFoundException('directory');

			jest.spyOn(service, 'delete').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'delete').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).rejects.toStrictEqual(error);
		});
	});
});
