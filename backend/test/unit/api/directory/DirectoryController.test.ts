import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectoryController } from 'src/api/directory/DirectoryController';
import { IDirectoryService } from 'src/api/directory/IDirectoryService';
import { DirectoryContentDto } from 'src/api/directory/mapping/content';
import { DirectoryCreateDto } from 'src/api/directory/mapping/create';
import { DirectoryDeleteDto } from 'src/api/directory/mapping/delete';
import { DirectoryDownloadDto } from 'src/api/directory/mapping/download';
import { DirectoryMetadataDto } from 'src/api/directory/mapping/metadata';
import { DirectoryRenameDto } from 'src/api/directory/mapping/rename';
import { DirectoryRestoreDto } from 'src/api/directory/mapping/restore';

import { ServerError } from 'src/util/ServerError';
import { ValidationError } from 'src/util/ValidationError';

describe('DirectoryController', () => {
	let controller: DirectoryController;
	let service: IDirectoryService;

	beforeAll(async () => {
		const fileService: IDirectoryService = {
			content: jest.fn(),
			metadata: jest.fn(),
			download: jest.fn(),
			restore: jest.fn(),
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

	describe('content', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'content').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryContentDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.content(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'content').mockResolvedValueOnce(0 as any);
			jest.spyOn(DirectoryContentDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.content(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'content').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryContentDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.content(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'content').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryContentDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.content(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});

	describe('metadata', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'metadata').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'metadata').mockResolvedValueOnce(0 as any);
			jest.spyOn(DirectoryMetadataDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.metadata(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'metadata').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'metadata').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});

	describe('download', () => {
		it("should resolve with the response of the service if the file and the params are valid and the server doesn't throw", async () => {
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

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'download').mockResolvedValueOnce(0 as any);
			jest.spyOn(DirectoryDownloadDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.download(0 as any, 0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'download').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryDownloadDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.download(0 as any, 0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'download').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryDownloadDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.download(0 as any, 0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});

	describe('restore', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'restore').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryRestoreDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.restore(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'restore').mockResolvedValueOnce(0 as any);
			jest.spyOn(DirectoryRestoreDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.restore(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'restore').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryRestoreDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.restore(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'restore').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryRestoreDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.restore(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});

	describe('create', () => {
		it("should resolve with the response of the service if the file and the params are valid and the server doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'create').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryCreateDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.create(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'create').mockResolvedValueOnce(0 as any);
			jest.spyOn(DirectoryCreateDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.create(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'create').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryCreateDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.create(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'create').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryCreateDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.create(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});

	describe('rename', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'rename').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'rename').mockResolvedValueOnce(0 as any);
			jest.spyOn(DirectoryRenameDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'rename').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'rename').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});

	describe('delete', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'delete').mockResolvedValueOnce(response as any);
			jest.spyOn(DirectoryDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'delete').mockResolvedValueOnce(0 as any);
			jest.spyOn(DirectoryDeleteDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.delete(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'delete').mockRejectedValueOnce(error);
			jest.spyOn(DirectoryDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'delete').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(DirectoryDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});
});
