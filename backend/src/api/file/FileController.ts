import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Logger,
	Param,
	Patch,
	Post,
	Put,
	Res,
	StreamableFile,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { FileService } from 'src/api/file/FileService';
import { ServerError } from 'src/util/ServerError';

import { FileDeleteDto, FileDeleteParams, FileDeleteResponse } from 'src/api/file/mapping/delete';
import { FileDownloadDto, FileDownloadParams } from 'src/api/file/mapping/download';
import { FileMetadataDto, FileMetadataParams, FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileRenameBody, FileRenameDto, FileRenameParams, FileRenameResponse } from 'src/api/file/mapping/rename';
import { FileReplaceDto } from 'src/api/file/mapping/replace/FileReplaceDto';
import { FileReplaceParams } from 'src/api/file/mapping/replace/FileReplaceParams';
import { FileReplaceResponse } from 'src/api/file/mapping/replace/FileReplaceResponse';
import { FileRestoreDto, FileRestoreParams, FileRestoreResponse } from 'src/api/file/mapping/restore';
import { FileUploadDto, FileUploadParams, FileUploadResponse } from 'src/api/file/mapping/upload';

@Controller('file')
export class FileController {
	private readonly logger = new Logger(FileController.name);

	private readonly fileService: FileService;

	constructor(fileService: FileService) {
		this.fileService = fileService;
	}

	@Get(':path(*)/metadata')
	public async metadata(@Param() params: FileMetadataParams): Promise<FileMetadataResponse> {
		try {
			const fileMetadataDto = FileMetadataDto.from(params);

			return await this.fileService.metadata(fileMetadataDto);
		} catch (e) {
			if (e instanceof ServerError) {
				this.logger.error(e.message);
				throw e.toHttpException();
			} else {
				this.logger.error(e);
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Get(':path(*)/download')
	public async download(@Param() params: FileDownloadParams, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
		try {
			const fileDownloadDto = FileDownloadDto.from(params);

			const result = await this.fileService.download(fileDownloadDto);

			res.header({
				'Content-Type': result.mimeType,
				'Content-Disposition': `attachment; filename=${result.name}`,
			});

			return new StreamableFile(result.readable);
		} catch (e) {
			if (e instanceof ServerError) {
				this.logger.error(e.message);
				throw e.toHttpException();
			} else {
				this.logger.error(e);
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Post(':id/restore')
	public async restore(@Param() params: FileRestoreParams): Promise<FileRestoreResponse> {
		try {
			const fileRestoreDto = FileRestoreDto.from(params);

			return await this.fileService.restore(fileRestoreDto);
		} catch (e) {
			if (e instanceof ServerError) {
				this.logger.error(e.message);
				throw e.toHttpException();
			} else {
				this.logger.error(e);
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Post(':path(*)')
	@UseInterceptors(FileInterceptor('file'))
	public async upload(@Param() params: FileUploadParams, @UploadedFile() file: Express.Multer.File): Promise<FileUploadResponse> {
		try {
			if (!file) {
				throw new ServerError('file must not be empty', HttpStatus.BAD_REQUEST);
			}

			const fileUploadDto = FileUploadDto.from(params, file);

			return await this.fileService.upload(fileUploadDto);
		} catch (e) {
			if (e instanceof ServerError) {
				this.logger.error(e.message);
				throw e.toHttpException();
			} else {
				this.logger.error(e);
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Put(':path(*)')
	@UseInterceptors(FileInterceptor('file'))
	public async replace(@Param() params: FileReplaceParams, @UploadedFile() file: Express.Multer.File): Promise<FileReplaceResponse> {
		try {
			if (!file) {
				throw new ServerError('file must not be empty', HttpStatus.BAD_REQUEST);
			}

			const fileReplaceDto = FileReplaceDto.from(params, file);

			return await this.fileService.upload(fileReplaceDto);
		} catch (e) {
			if (e instanceof ServerError) {
				this.logger.error(e.message);
				throw e.toHttpException();
			} else {
				this.logger.error(e);
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Patch(':path(*)')
	public async rename(@Param() params: FileRenameParams, @Body() body: FileRenameBody): Promise<FileRenameResponse> {
		try {
			const fileRenameDto = FileRenameDto.from(params, body);

			return await this.fileService.rename(fileRenameDto);
		} catch (e) {
			if (e instanceof ServerError) {
				this.logger.error(e.message);
				throw e.toHttpException();
			} else {
				this.logger.error(e);
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}

	@Delete(':path(*)')
	public async delete(@Param() params: FileDeleteParams): Promise<FileDeleteResponse> {
		try {
			const fileDeleteDto = FileDeleteDto.from(params);

			return await this.fileService.delete(fileDeleteDto);
		} catch (e) {
			if (e instanceof ServerError) {
				this.logger.error(e.message);
				throw e.toHttpException();
			} else {
				this.logger.error(e);
				throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
			}
		}
	}
}
