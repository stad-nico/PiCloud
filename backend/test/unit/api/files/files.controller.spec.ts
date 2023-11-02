import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FilesController } from 'src/api/files/files.controller';
import { FilesService } from 'src/api/files/files.service';
import { FileDeleteResponse, FileMetadataResponse, FileUploadResponse } from 'src/api/files/responses';
import { ServerError } from 'src/util/ServerError';
import { mockedFilesService } from 'test/mock/mockedFilesService.spec';

import { Readable } from 'stream';

describe('FilesController', () => {
	let controller: FilesController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FilesController],
			providers: [
				{
					provide: FilesService,
					useValue: mockedFilesService,
				},
			],
		}).compile();

		module.useLogger(false);
		controller = module.get(FilesController);
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

		it('should throw BadRequestException if file is not given', async () => {
			const error = new ServerError('file must not be empty', HttpStatus.BAD_REQUEST);

			await expect(controller.uploadFile({ path: '' }, undefined as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw error if service throws ServerError', async () => {
			const error = new ServerError('path /test/ is not a valid path', HttpStatus.BAD_REQUEST);
			jest.spyOn(mockedFilesService, 'upload').mockRejectedValue(error);

			await expect(controller.uploadFile({ path: '' }, file)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw InternalServerError if service throws Error', async () => {
			const error = new Error('test error');
			jest.spyOn(mockedFilesService, 'upload').mockRejectedValue(error);

			await expect(controller.uploadFile({ path: '' }, file)).rejects.toStrictEqual(
				new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException()
			);
		});

		it('should return response if service returns response', async () => {
			const response = new FileUploadResponse('test');
			jest.spyOn(mockedFilesService, 'upload').mockResolvedValue(response);

			await expect(controller.uploadFile({ path: '' }, file)).resolves.toStrictEqual(response);
		});
	});

	describe('get metadata', () => {
		it('should throw error if service throws ServerError', async () => {
			const error = new ServerError('path /test/ is not a valid path', HttpStatus.BAD_REQUEST);
			jest.spyOn(mockedFilesService, 'getMetadata').mockRejectedValue(error);

			await expect(controller.getMetadata({ path: '' })).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw InternalServerError if service throws Error', async () => {
			const error = new Error('test error');
			jest.spyOn(mockedFilesService, 'getMetadata').mockRejectedValue(error);

			await expect(controller.getMetadata({ path: '' })).rejects.toStrictEqual(
				new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException()
			);
		});

		it('should return response if service returns response', async () => {
			const response = new FileMetadataResponse('', '', '', '', 0, new Date(), new Date());
			jest.spyOn(mockedFilesService, 'getMetadata').mockResolvedValue(response);

			await expect(controller.getMetadata({ path: '' })).resolves.toStrictEqual(response);
		});
	});

	describe('download', () => {
		it('should throw error if service throws ServerError', async () => {
			const error = new ServerError('path /test/ is not a valid path', HttpStatus.BAD_REQUEST);
			jest.spyOn(mockedFilesService, 'download').mockRejectedValue(error);

			await expect(controller.download({ path: '' }, { header: () => {} } as any)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw InternalServerError if service throws Error', async () => {
			const error = new Error('test error');
			jest.spyOn(mockedFilesService, 'download').mockRejectedValue(error);

			await expect(controller.download({ path: '' }, { header: () => {} } as any)).rejects.toStrictEqual(
				new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException()
			);
		});

		it('should return streamable file and set headers', async () => {
			const res = { header: () => {} };
			const resSpy = jest.spyOn(res, 'header');
			const result = {
				mimeType: 'test/mime',
				name: 'test.txt',
				readableStream: Readable.from('test content'),
			};
			jest.spyOn(mockedFilesService, 'download').mockResolvedValue(result);

			await expect((await controller.download({ path: '' }, res as any)).getStream().read()).toStrictEqual('test content');
			expect(resSpy).toBeCalledWith({
				'Content-Type': 'test/mime',
				'Content-Disposition': 'attachment; filename=test.txt',
			});
		});
	});

	describe('delete', () => {
		it('should throw error if service throws ServerError', async () => {
			const error = new ServerError('path /test/ is not a valid path', HttpStatus.BAD_REQUEST);
			jest.spyOn(mockedFilesService, 'delete').mockRejectedValue(error);

			await expect(controller.delete({ path: '' })).rejects.toStrictEqual(error.toHttpException());
		});

		it('should throw InternalServerError if service throws Error', async () => {
			const error = new Error('test error');
			jest.spyOn(mockedFilesService, 'delete').mockRejectedValue(error);

			await expect(controller.delete({ path: '' })).rejects.toStrictEqual(
				new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException()
			);
		});

		it('should return response if service returns response', async () => {
			const response = new FileDeleteResponse();
			jest.spyOn(mockedFilesService, 'delete').mockResolvedValue(response);

			await expect(controller.delete({ path: '' })).resolves.toStrictEqual(response);
		});
	});
});
