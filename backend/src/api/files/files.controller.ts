import {
	BadRequestException,
	Controller,
	Get,
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
import { FileDownloadDto } from 'src/api/files/dtos/file.download.dto';

import { FileMetadataDto } from 'src/api/files/dtos/file.metadata.dto';
import { FileMetadataResponseDto } from 'src/api/files/dtos/file.metadata.response.dto';
import { FileUploadDto } from 'src/api/files/dtos/file.upload.dto';
import { FileUploadResponseDto } from 'src/api/files/dtos/file.upload.response.dto';
import { FileDownloadEntity } from 'src/api/files/entities/file.download.entity';
import { FileMetadataEntity } from 'src/api/files/entities/file.metadata.entity';
import { FileUploadEntity } from 'src/api/files/entities/file.upload.entity';
import { FilesService } from 'src/api/files/files.service';
import { ServerError } from 'src/util/ServerError';

@Controller('files')
export class FilesController {
	private readonly filesService: FilesService;

	constructor(fileService: FilesService) {
		this.filesService = fileService;
	}

	@Post(':path(*)')
	@UseInterceptors(FileInterceptor('file'))
	public async uploadFile(@Param() params: FileUploadDto, @UploadedFile() file: Express.Multer.File): Promise<FileUploadResponseDto> {
		const fullPath: string = params.path;

		if (!file) {
			throw new BadRequestException('file must not be empty');
		}

		const fileUploadEntity: FileUploadEntity = FileUploadEntity.from(fullPath, file);

		try {
			return await this.filesService.upload(fileUploadEntity);
		} catch (e) {
			if (e instanceof ServerError) {
				throw e.toHttpException();
			} else {
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Get(':path(*)/metadata')
	public async getMetadata(@Param() params: FileMetadataDto): Promise<FileMetadataResponseDto> {
		const fileMetadataEntity: FileMetadataEntity = FileMetadataEntity.from(params);

		try {
			return await this.filesService.getMetadata(fileMetadataEntity);
		} catch (e) {
			if (e instanceof ServerError) {
				throw e.toHttpException();
			} else {
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Get(':path(*)/download')
	public async download(@Param() params: FileDownloadDto, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
		const fileDownloadEntity: FileDownloadEntity = FileDownloadEntity.from(params);

		try {
			const result = await this.filesService.download(fileDownloadEntity);

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
}
