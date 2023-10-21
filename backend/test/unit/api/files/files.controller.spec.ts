import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadResponseDto } from 'src/api/files/dtos/file.upload.response.dto';
import { FilesController } from 'src/api/files/files.controller';
import { FilesService } from 'src/api/files/files.service';
import { ServerError } from 'src/util/ServerError';
import { Readable } from 'stream';
import { mockedFilesService } from 'test/mock/mockedFilesService.spec';

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

			await expect(controller.upload({ path: '' }, undefined as any)).rejects.toStrictEqual(error);
		});

		it('should throw error if service returns error', async () => {
			const error = new ServerError('path /test/ is not a valid path', HttpStatus.BAD_REQUEST);

			jest.spyOn(mockedFilesService, 'upload').mockResolvedValue(error);

			await expect(controller.upload({ path: '' }, file)).rejects.toStrictEqual(error.toHttpException());
		});

		it('should return response if service returns file', async () => {
			jest.spyOn(mockedFilesService, 'upload').mockResolvedValue({ fullPath: 'test' });

			await expect(controller.upload({ path: '' }, file)).resolves.toStrictEqual(new FileUploadResponseDto('test'));
		});
	});
});
