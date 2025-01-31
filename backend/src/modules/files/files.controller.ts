/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Response } from 'express';

import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpException,
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
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { FileApiDocs } from 'src/modules/files/file.api-docs';
import { FileService } from 'src/modules/files/file.service';
import { FileDeleteDto } from 'src/modules/files/mapping/delete/FileDeleteDto';
import { FileDeleteParams } from 'src/modules/files/mapping/delete/FileDeleteParams';
import { FileDownloadDto } from 'src/modules/files/mapping/download/FileDownloadDto';
import { FileDownloadParams } from 'src/modules/files/mapping/download/FileDownloadParams';
import { FileMetadataDto } from 'src/modules/files/mapping/metadata/FileMetadataDto';
import { FileMetadataParams } from 'src/modules/files/mapping/metadata/FileMetadataParams';
import { FileMetadataResponse } from 'src/modules/files/mapping/metadata/FileMetadataResponse';
import { FileRenameBody } from 'src/modules/files/mapping/rename/FileRenameBody';
import { FileRenameDto } from 'src/modules/files/mapping/rename/FileRenameDto';
import { FileRenameParams } from 'src/modules/files/mapping/rename/FileRenameParams';
import { FileReplaceBody } from 'src/modules/files/mapping/replace/FileReplaceBody';
import { FileReplaceDto } from 'src/modules/files/mapping/replace/FileReplaceDto';
import { FileReplaceResponse } from 'src/modules/files/mapping/replace/FileReplaceResponse';
import { FileUploadBody } from 'src/modules/files/mapping/upload/FileUploadBody';
import { FileUploadDto } from 'src/modules/files/mapping/upload/FileUploadDto';
import { FileUploadResponse } from 'src/modules/files/mapping/upload/FileUploadResponse';
import { Jwt } from 'src/shared/decorators/jwt.decorator';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';

@Controller('files')
@FileApiDocs.controller()
export class FilesController {
	private readonly logger = new Logger(FilesController.name);

	public constructor(private readonly fileService: FileService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@UseInterceptors(FileInterceptor('file'))
	@FileApiDocs.upload()
	public async upload(
		@Body() body: FileUploadBody,
		@UploadedFile() file: Express.Multer.File,
		@Jwt() jwt: JwtPayload
	): Promise<FileUploadResponse> {
		this.logger.log(`[Upload] ${body.directoryId}`);

		try {
			const fileUploadDto = FileUploadDto.from(body, file, jwt);

			return await this.fileService.upload(fileUploadDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Put()
	@HttpCode(HttpStatus.CREATED)
	@UseInterceptors(FileInterceptor('file'))
	@FileApiDocs.replace()
	public async replace(
		@Body() body: FileReplaceBody,
		@UploadedFile() file: Express.Multer.File,
		@Jwt() jwt: JwtPayload
	): Promise<FileReplaceResponse> {
		this.logger.log(`[Replace] ${body.directoryId}`);

		try {
			const fileReplaceDto = FileReplaceDto.from(body, file, jwt);

			return await this.fileService.replace(fileReplaceDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get(':id/metadata')
	@HttpCode(HttpStatus.OK)
	@FileApiDocs.metadata()
	public async metadata(@Param() params: FileMetadataParams, @Jwt() jwt: JwtPayload): Promise<FileMetadataResponse> {
		try {
			const fileMetadataDto = FileMetadataDto.from(params, jwt);

			return await this.fileService.metadata(fileMetadataDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get(':id/download')
	@HttpCode(HttpStatus.OK)
	@FileApiDocs.download()
	public async download(
		@Param() params: FileDownloadParams,
		@Res({ passthrough: true }) res: Response,
		@Jwt() jwt: JwtPayload
	): Promise<StreamableFile> {
		try {
			const fileDownloadDto = FileDownloadDto.from(params, jwt);

			const result = await this.fileService.download(fileDownloadDto);

			res.header({
				'Content-Type': result.mimeType,
				'Content-Disposition': `attachment; filename=${result.name}`,
			});

			return new StreamableFile(result.readable);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Patch(':id/rename')
	@HttpCode(HttpStatus.NO_CONTENT)
	@FileApiDocs.rename()
	public async rename(@Param() params: FileRenameParams, @Body() body: FileRenameBody, @Jwt() jwt: JwtPayload): Promise<void> {
		try {
			const fileRenameDto = FileRenameDto.from(params, body, jwt);

			await this.fileService.rename(fileRenameDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@FileApiDocs.delete()
	public async delete(@Param() params: FileDeleteParams, @Jwt() jwt: JwtPayload): Promise<void> {
		try {
			const fileDeleteDto = FileDeleteDto.from(params, jwt);

			await this.fileService.delete(fileDeleteDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}
}
