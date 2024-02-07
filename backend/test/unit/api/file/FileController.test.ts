import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FileController } from 'src/api/file/FileController';
import { IFileService } from 'src/api/file/IFileService';
import { FileDeleteDto } from 'src/api/file/mapping/delete';
import { FileMetadataDto } from 'src/api/file/mapping/metadata';
import { FileRenameDto } from 'src/api/file/mapping/rename';
import { FileRestoreDto } from 'src/api/file/mapping/restore';
import { ServerError } from 'src/util/ServerError';
import { ValidationError } from 'src/util/ValidationError';

describe('FileController', () => {
	let controller: FileController;
	let service: IFileService;

	beforeAll(async () => {
		const fileService: IFileService = {
			metadata: jest.fn(),
			download: jest.fn(),
			delete: jest.fn(),
			upload: jest.fn(),
			restore: jest.fn(),
			rename: jest.fn(),
			replace: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [FileController],
			providers: [
				{
					provide: IFileService,
					useValue: fileService,
				},
			],
		}).compile();

		module.useLogger(false);
		controller = module.get(FileController);
		service = module.get(IFileService);
	});

	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe('metadata', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'metadata').mockResolvedValueOnce(response as any);
			jest.spyOn(FileMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'metadata').mockResolvedValueOnce(0 as any);
			jest.spyOn(FileMetadataDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.metadata(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'metadata').mockRejectedValueOnce(error);
			jest.spyOn(FileMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'metadata').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(FileMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});

	describe('restore', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'restore').mockResolvedValueOnce(response as any);
			jest.spyOn(FileRestoreDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.restore(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'restore').mockResolvedValueOnce(0 as any);
			jest.spyOn(FileRestoreDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.restore(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'restore').mockRejectedValueOnce(error);
			jest.spyOn(FileRestoreDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.restore(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'restore').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(FileRestoreDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.restore(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});

	describe('rename', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'rename').mockResolvedValueOnce(response as any);
			jest.spyOn(FileRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'rename').mockResolvedValueOnce(0 as any);
			jest.spyOn(FileRenameDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'rename').mockRejectedValueOnce(error);
			jest.spyOn(FileRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'rename').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(FileRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});

	describe('delete', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'delete').mockResolvedValueOnce(response as any);
			jest.spyOn(FileDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the ValidationError if params are invalid', async () => {
			const error = new ValidationError('nop');

			jest.spyOn(service, 'delete').mockResolvedValueOnce(0 as any);
			jest.spyOn(FileDeleteDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.delete(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should rethrow the ServerError if the service throws a ServerError', async () => {
			const error = new ServerError('service error', HttpStatus.BAD_REQUEST);

			jest.spyOn(service, 'delete').mockRejectedValueOnce(error);
			jest.spyOn(FileDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw an InternalServerError if the service throws a native error', async () => {
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(service, 'delete').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(FileDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).rejects.toStrictEqual(error.toHttpException());
		});
	});
});
