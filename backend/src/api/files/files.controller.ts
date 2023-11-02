import {
	BadRequestException,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Res,
	StreamableFile,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { FileDeleteDto, FileDownloadDto, FileMetadataDto, FileUploadDto } from 'src/api/files/dtos';
import { FilesService } from 'src/api/files/files.service';
import { FileDeleteParams, FileDownloadParams, FileMetadataParams, FileUploadParams } from 'src/api/files/params';
import { FileDeleteResponse, FileDownloadResponse, FileMetadataResponse, FileUploadResponse } from 'src/api/files/responses';
import { ServerError } from 'src/util/ServerError';

@Controller('files')
export class FilesController {
	private readonly filesService: FilesService;

	constructor(fileService: FilesService) {
		this.filesService = fileService;
	}

	@Post(':path(*)')
	@UseInterceptors(FileInterceptor('file'))
	public async uploadFile(@Param() params: FileUploadParams, @UploadedFile() file: Express.Multer.File): Promise<FileUploadResponse> {
		const fullPath: string = params.path;

		if (!file) {
			throw new BadRequestException('file must not be empty');
		}

		try {
			const fileUploadDto: FileUploadDto = FileUploadDto.from(fullPath, file);

			return await this.filesService.upload(fileUploadDto);
		} catch (e) {
			if (e instanceof ServerError) {
				throw e.toHttpException();
			} else {
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Get(':path(*)/metadata')
	public async getMetadata(@Param() params: FileMetadataParams): Promise<FileMetadataResponse> {
		try {
			const fileMetadataDto: FileMetadataDto = FileMetadataDto.from(params);

			return await this.filesService.getMetadata(fileMetadataDto);
		} catch (e) {
			if (e instanceof ServerError) {
				throw e.toHttpException();
			} else {
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Get(':path(*)/download')
	public async download(@Param() params: FileDownloadParams, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
		try {
			const fileDownloadDto: FileDownloadDto = FileDownloadDto.from(params);
			const result: FileDownloadResponse = await this.filesService.download(fileDownloadDto);

			result.readableStream.on('error', () => {
				res.header({
					'Content-Type': 'application/json',
				})
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.json(new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException().getResponse());
			});

			res.header({
				'Content-Type': result.mimeType,
				'Content-Disposition': `attachment; filename=${result.name}`,
			});

			return new StreamableFile(result.readableStream);
		} catch (e) {
			if (e instanceof ServerError) {
				throw e.toHttpException();
			} else {
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Delete(':path(*)')
	@HttpCode(204)
	public async delete(@Param() params: FileDeleteParams): Promise<FileDeleteResponse> {
		try {
			const fileDeleteDto: FileDeleteDto = FileDeleteDto.from(params);

			return await this.filesService.delete(fileDeleteDto);
		} catch (e) {
			if (e instanceof ServerError) {
				throw e.toHttpException();
			} else {
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}
}
