import { HttpStatus, StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FileController } from 'src/api/file/file.controller';
import { FileService } from 'src/api/file/file.service';
import { ServerError } from 'src/util/ServerError';
import { mockedFilesService } from 'test/mocks/mockedFilesService.spec';

import { ReadStream } from 'fs';
import { FileDeleteParams, FileDeleteResponse } from 'src/api/file/classes/delete';
import { FileDownloadParams, FileDownloadResponse } from 'src/api/file/classes/download';
import { FileMetadataParams } from 'src/api/file/classes/metadata';
import { FileRenameBody, FileRenameParams, FileRenameQueryParams, FileRenameResponse } from 'src/api/file/classes/rename';
import { FileUploadParams, FileUploadQueryParams, FileUploadResponse } from 'src/api/file/classes/upload';
import { Readable } from 'stream';

describe('FileController', () => {
	let controller: FileController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FileController],
			providers: [
				{
					provide: FileService,
					useValue: mockedFilesService,
				},
			],
		}).compile();

		module.useLogger(false);
		controller = module.get(FileController);
	});

	describe('upload', () => {
		const file: Express.Multer.File = {
			mimetype: 'text/plain',
			buffer: Buffer.from(''),
			size: 0,
			fieldname: '',
			stream: new Readable(),
			originalname: '',
			encoding: '',
			destination: '',
			filename: '',
			path: '',
		};

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should throw BadRequestException if file is not given', async () => {
			const params = new FileUploadParams('');
			const query = new FileUploadQueryParams();
			const error = new ServerError('file must not be empty', HttpStatus.BAD_REQUEST);

			await expect(controller.upload(params, query, null as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw error if service throws ServerError', async () => {
			const params = new FileUploadParams('');
			const query = new FileUploadQueryParams();
			const error = new ServerError('path /test/ is not a valid path', HttpStatus.BAD_REQUEST);

			jest.spyOn(mockedFilesService, 'upload').mockRejectedValueOnce(error);

			await expect(controller.upload(params, query, file)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw InternalServerError if service throws Error', async () => {
			const params = new FileUploadParams('');
			const query = new FileUploadQueryParams();
			const serviceError = new Error('test error');
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(mockedFilesService, 'upload').mockRejectedValueOnce(serviceError);

			await expect(controller.upload(params, query, file)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should return response if service returns response', async () => {
			const params = new FileUploadParams('');
			const query = new FileUploadQueryParams();
			const response = new (FileUploadResponse as any)('test');

			jest.spyOn(mockedFilesService, 'upload').mockResolvedValueOnce(response);

			await expect(controller.upload(params, query, file)).resolves.toStrictEqual(response);
		});
	});

	describe('metadata', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should throw error if service throws ServerError', async () => {
			const params = new FileMetadataParams('');
			const error = new ServerError('path /test/ is not a valid path', HttpStatus.BAD_REQUEST);

			jest.spyOn(mockedFilesService, 'metadata').mockRejectedValueOnce(error);

			await expect(controller.metadata(params)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw InternalServerError if service throws Error', async () => {
			const params = new FileMetadataParams('');
			const serviceError = new Error('test error');
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(mockedFilesService, 'metadata').mockRejectedValueOnce(serviceError);

			await expect(controller.metadata(params)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should return response if service returns response', async () => {
			const params = new FileMetadataParams('');
			const response = new (FileUploadResponse as any)('test');

			jest.spyOn(mockedFilesService, 'metadata').mockResolvedValueOnce(response);

			await expect(controller.metadata(params)).resolves.toStrictEqual(response);
		});
	});

	describe('download', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		it('should throw error if service throws ServerError', async () => {
			const params = new FileDownloadParams('');
			const error = new ServerError('test', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(mockedFilesService, 'download').mockRejectedValueOnce(error);

			await expect(controller.download(params, null as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw InternalServerError if service throws error', async () => {
			const params = new FileDownloadParams('');
			const serviceError = new Error('error');
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(mockedFilesService, 'download').mockRejectedValueOnce(serviceError);

			await expect(controller.download(params, null as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should set response to InternalServerError if ReadStream fails', async () => {
			const response = { header: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
			var errorFunction = null;
			const result = FileDownloadResponse.from('', '', {
				on: (a: string, callback: Function) => {
					errorFunction = callback;
				},
			} as any);
			const params = new FileDownloadParams('');
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException().getResponse();

			jest.spyOn(mockedFilesService, 'download').mockResolvedValueOnce(result);

			await controller.download(params, response as any);

			expect(errorFunction).not.toBeNull();

			errorFunction!();

			expect(response.header).toHaveBeenCalledWith({ 'Content-Type': 'application/json' });
			expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
			expect(response.json).toHaveBeenCalledWith(error);
		});

		it('should return response if service returns response and set correct headers', async () => {
			const response = { header: jest.fn() };
			const params = new FileDownloadParams('');
			const result = FileDownloadResponse.from('testName', 'testMime', new ReadStream('.' as any));

			jest.spyOn(mockedFilesService, 'download').mockResolvedValueOnce(result);

			await expect(controller.download(params, response as any)).resolves.toBeInstanceOf(StreamableFile);
			expect(response.header).toHaveBeenCalledWith({
				'Content-Type': 'testMime',
				'Content-Disposition': 'attachment; filename=testName',
			});
		});
	});

	describe('rename', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should throw error if service throws ServerError', async () => {
			const params = new FileRenameParams('');
			const query = new FileRenameQueryParams();
			const body = new FileRenameBody('');
			const error = new ServerError('test', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(mockedFilesService, 'rename').mockRejectedValueOnce(error);

			await expect(controller.rename(params, query, body)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw InternalServerError if service throws error', async () => {
			const params = new FileRenameParams('');
			const query = new FileRenameQueryParams();
			const body = new FileRenameBody('');
			const serviceError = new Error('');
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(mockedFilesService, 'rename').mockRejectedValueOnce(serviceError);

			await expect(controller.rename(params, query, body)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should return response if service returns response', async () => {
			const params = new FileRenameParams('');
			const query = new FileRenameQueryParams();
			const body = new FileRenameBody('');
			const response = new (FileRenameResponse as any)('abc');

			jest.spyOn(mockedFilesService, 'rename').mockResolvedValueOnce(response);

			await expect(controller.rename(params, query, body)).resolves.toStrictEqual(response);
		});
	});

	describe('delete', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should throw error if service throws ServerError', async () => {
			const params = new FileDeleteParams('');
			const error = new ServerError('test', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(mockedFilesService, 'delete').mockRejectedValueOnce(error);

			await expect(controller.delete(params)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw InternalServerError if service throws error', async () => {
			const params = new FileDeleteParams('');
			const serviceError = new Error('');
			const error = new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);

			jest.spyOn(mockedFilesService, 'delete').mockRejectedValueOnce(serviceError);

			await expect(controller.delete(params)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should return response if service returns response', async () => {
			const params = new FileDeleteParams('');
			const response = new (FileDeleteResponse as any)('abc');

			jest.spyOn(mockedFilesService, 'delete').mockResolvedValueOnce(response);

			await expect(controller.delete(params)).resolves.toStrictEqual(response);
		});
	});
});
