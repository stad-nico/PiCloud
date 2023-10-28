import { BadRequestException, Controller, Get, HttpStatus, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FileMetadataDto } from 'src/api/files/dtos/file.metadata.dto';
import { FileMetadataResponseDto } from 'src/api/files/dtos/file.metadata.response.dto';
import { FileUploadDto } from 'src/api/files/dtos/file.upload.dto';
import { FileUploadResponseDto } from 'src/api/files/dtos/file.upload.response.dto';
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
		let fullPath: string = params.path;

		if (!file) {
			throw new BadRequestException('file must not be empty');
		}

		let fileUploadEntity: FileUploadEntity = FileUploadEntity.from(fullPath, file);

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
		let fileMetadataEntity: FileMetadataEntity = FileMetadataEntity.from(params);
		console.log(params);

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
}
