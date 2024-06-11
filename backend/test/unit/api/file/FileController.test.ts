import { Test, TestingModule } from '@nestjs/testing';

import { FileController } from 'src/api/file/FileController';
import { IFileService } from 'src/api/file/IFileService';
import { FileDeleteDto } from 'src/api/file/mapping/delete';
import { FileDownloadDto } from 'src/api/file/mapping/download';
import { FileMetadataDto } from 'src/api/file/mapping/metadata';
import { FileRenameDto } from 'src/api/file/mapping/rename';
import { FileReplaceDto } from 'src/api/file/mapping/replace';
import { FileUploadDto } from 'src/api/file/mapping/upload';
import { FileNameTooLongException } from 'src/exceptions/FileNameTooLongException';
import { FileNotFoundException } from 'src/exceptions/FileNotFoundException';
import { ParentDirectoryNotFoundException } from 'src/exceptions/ParentDirectoryNotFoundExceptions';
import { SomethingWentWrongException } from 'src/exceptions/SomethingWentWrongException';

describe('FileController', () => {
	let controller: FileController;
	let service: IFileService;

	beforeAll(async () => {
		const fileService: IFileService = {
			metadata: jest.fn(),
			download: jest.fn(),
			delete: jest.fn(),
			upload: jest.fn(),
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

	describe('upload', () => {
		it("should resolve with the response of the service if the file and the params are valid and the server doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'upload').mockResolvedValueOnce(response as any);
			jest.spyOn(FileUploadDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.upload(0 as any, 0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the exception if params are invalid', async () => {
			const error = new FileNameTooLongException('filename');

			jest.spyOn(service, 'upload').mockResolvedValueOnce(0 as any);
			jest.spyOn(FileUploadDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.upload(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new ParentDirectoryNotFoundException('parentDirectory');

			jest.spyOn(service, 'upload').mockRejectedValueOnce(error);
			jest.spyOn(FileUploadDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.upload(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'upload').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(FileUploadDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.upload(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});
	});

	describe('replace', () => {
		it("should resolve with the response of the service if the file and the params are valid and the server doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'replace').mockResolvedValueOnce(response as any);
			jest.spyOn(FileReplaceDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.replace(0 as any, 0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the exception if params are invalid', async () => {
			const error = new FileNameTooLongException('filename');

			jest.spyOn(service, 'replace').mockResolvedValueOnce(0 as any);
			jest.spyOn(FileReplaceDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.replace(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new ParentDirectoryNotFoundException('filename');

			jest.spyOn(service, 'replace').mockRejectedValueOnce(error);
			jest.spyOn(FileReplaceDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.replace(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw an SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'replace').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(FileReplaceDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.replace(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});
	});

	describe('metadata', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'metadata').mockResolvedValueOnce(response as any);
			jest.spyOn(FileMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new FileNotFoundException('file');

			jest.spyOn(service, 'metadata').mockRejectedValueOnce(error);
			jest.spyOn(FileMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'metadata').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(FileMetadataDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.metadata(0 as any)).rejects.toStrictEqual(error);
		});
	});

	describe('rename', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			const response = 'response';

			jest.spyOn(service, 'rename').mockResolvedValueOnce(response as any);
			jest.spyOn(FileRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).resolves.toStrictEqual(response);
		});

		it('should rethrow the exception if params are invalid', async () => {
			const error = new FileNameTooLongException('filename');

			jest.spyOn(service, 'rename').mockResolvedValueOnce(0 as any);
			jest.spyOn(FileRenameDto, 'from').mockImplementationOnce(() => {
				throw error;
			});

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new FileNotFoundException('file');

			jest.spyOn(service, 'rename').mockRejectedValueOnce(error);
			jest.spyOn(FileRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'rename').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(FileRenameDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.rename(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});
	});

	describe('download', () => {
		it("should resolve with the response of the service if the file and the params are valid and the server doesn't throw", async () => {
			const response = { mimeType: 'text/plain', name: 'test', readable: Buffer.from('content') };
			const res = { header: jest.fn() };

			jest.spyOn(service, 'download').mockResolvedValueOnce(response as any);
			jest.spyOn(FileDownloadDto, 'from').mockReturnValueOnce(0 as any);

			expect((await controller.download(0 as any, res as any)).getStream().read()).toStrictEqual(response.readable);
			expect(res.header).toHaveBeenCalledWith({
				'Content-Type': response.mimeType,
				'Content-Disposition': `attachment; filename=${response.name}`,
			});
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new FileNotFoundException('filename');

			jest.spyOn(service, 'download').mockRejectedValueOnce(error);
			jest.spyOn(FileDownloadDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.download(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'download').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(FileDownloadDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.download(0 as any, 0 as any)).rejects.toStrictEqual(error);
		});
	});

	describe('delete', () => {
		it("should resolve with the response of the service if the params are valid and the service doesn't throw", async () => {
			jest.spyOn(service, 'delete').mockResolvedValueOnce();
			jest.spyOn(FileDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).resolves.not.toThrow();
		});

		it('should rethrow the exception if the service throws an http exception', async () => {
			const error = new FileNotFoundException('filename');

			jest.spyOn(service, 'delete').mockRejectedValueOnce(error);
			jest.spyOn(FileDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).rejects.toStrictEqual(error);
		});

		it('should throw a SomethingWentWrongException if the service throws a native error', async () => {
			const error = new SomethingWentWrongException();

			jest.spyOn(service, 'delete').mockRejectedValueOnce(new Error('service error'));
			jest.spyOn(FileDeleteDto, 'from').mockReturnValueOnce(0 as any);

			await expect(controller.delete(0 as any)).rejects.toStrictEqual(error);
		});
	});
});
