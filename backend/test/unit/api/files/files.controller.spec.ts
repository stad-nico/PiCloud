import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FileMetadataResponseDto } from 'src/api/files/dtos/file.metadata.response.dto';
import { FileUploadResponseDto } from 'src/api/files/dtos/file.upload.response.dto';
import { FilesController } from 'src/api/files/files.controller';
import { FilesService } from 'src/api/files/files.service';
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

		module.useLogger(undefined as any);
		controller = module.get<FilesController>(FilesController);
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
			const error = new BadRequestException('file must not be empty');

			await expect(controller.uploadFile({ path: '' }, undefined as any)).rejects.toStrictEqual(error);
		});

		it('should throw http exception if service throws error', async () => {
			const error = new ServerError('path /test/ is not a valid path', HttpStatus.BAD_REQUEST);
			jest.spyOn(mockedFilesService, 'upload').mockRejectedValue(error);

			await expect(controller.uploadFile({ path: '' }, file)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should return response if service returns response', async () => {
			const response = new FileUploadResponseDto('test');
			jest.spyOn(mockedFilesService, 'upload').mockResolvedValue(response);

			await expect(controller.uploadFile({ path: '' }, file)).resolves.toStrictEqual(response);
		});
	});

	describe('get metadata', () => {
		it('should throw http exception if service throws error', async () => {
			const error = new ServerError('this is an error', HttpStatus.NOT_FOUND);
			jest.spyOn(mockedFilesService, 'getMetadata').mockRejectedValue(error);

			await expect(controller.getMetadata({ path: '' })).rejects.toStrictEqual(error.toHttpException());
		});

		it('should return response if service returns response', async () => {
			const response = new FileMetadataResponseDto('', '', '', '', 0, new Date(), new Date());
			jest.spyOn(mockedFilesService, 'getMetadata').mockResolvedValue(response);

			await expect(controller.getMetadata({ path: '' })).resolves.toStrictEqual(response);
		});
	});

	describe('download', () => {
		it('should throw http exception if service throws error', async () => {
			const error = new ServerError('test error', HttpStatus.NOT_FOUND);
			jest.spyOn(mockedFilesService, 'download').mockRejectedValue(error);

			await expect(controller.download({ path: '' }, { header: () => {} } as any)).rejects.toStrictEqual(error.toHttpException());
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
});
