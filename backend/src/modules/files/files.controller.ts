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
import { DeleteFileDto } from 'src/modules/files/mapping/delete/delete-file.dto';
import { DeleteFileParams } from 'src/modules/files/mapping/delete/delete-file.params';
import { DownloadFileDto } from 'src/modules/files/mapping/download/download-file.dto';
import { DownlaodFileParams } from 'src/modules/files/mapping/download/download-file.params';
import { GetFileMetadataDto } from 'src/modules/files/mapping/metadata/get-file-metadata.dto';
import { GetFileMetadataParams } from 'src/modules/files/mapping/metadata/get-file-metadata.params';
import { GetFileMetadataResponse } from 'src/modules/files/mapping/metadata/get-file-metadata.response';
import { RenameFileBody } from 'src/modules/files/mapping/rename/rename-file.body';
import { RenameFileDto } from 'src/modules/files/mapping/rename/rename-file.dto';
import { RenameFileParams } from 'src/modules/files/mapping/rename/rename-file.params';
import { ReplaceFileBody } from 'src/modules/files/mapping/replace/replace-file.body';
import { ReplaceFileDto } from 'src/modules/files/mapping/replace/replace-file.dto';
import { ReplaceFileResponse } from 'src/modules/files/mapping/replace/replace-file.response';
import { UploadFileBody } from 'src/modules/files/mapping/upload/upload-file.body';
import { UploadFileDto } from 'src/modules/files/mapping/upload/upload-file.dto';
import { UploadFileResponse } from 'src/modules/files/mapping/upload/upload-file.response';
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
		@Body() body: UploadFileBody,
		@UploadedFile() file: Express.Multer.File,
		@Jwt() jwt: JwtPayload
	): Promise<UploadFileResponse> {
		this.logger.log(`[Upload] ${body.directoryId}`);

		try {
			const uploadFileDto = UploadFileDto.from(body, file, jwt);

			return await this.fileService.upload(uploadFileDto);
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
		@Body() body: ReplaceFileBody,
		@UploadedFile() file: Express.Multer.File,
		@Jwt() jwt: JwtPayload
	): Promise<ReplaceFileResponse> {
		this.logger.log(`[Replace] ${body.directoryId}`);

		try {
			const replaceFileDto = ReplaceFileDto.from(body, file, jwt);

			return await this.fileService.replace(replaceFileDto);
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
	public async metadata(@Param() params: GetFileMetadataParams, @Jwt() jwt: JwtPayload): Promise<GetFileMetadataResponse> {
		try {
			const getFileMetadataDto = GetFileMetadataDto.from(params, jwt);

			return await this.fileService.metadata(getFileMetadataDto);
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
		@Param() params: DownlaodFileParams,
		@Res({ passthrough: true }) res: Response,
		@Jwt() jwt: JwtPayload
	): Promise<StreamableFile> {
		try {
			const downloadFileDto = DownloadFileDto.from(params, jwt);

			const result = await this.fileService.download(downloadFileDto);

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
	public async rename(@Param() params: RenameFileParams, @Body() body: RenameFileBody, @Jwt() jwt: JwtPayload): Promise<void> {
		try {
			const renameFileDto = RenameFileDto.from(params, body, jwt);

			await this.fileService.rename(renameFileDto);
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
	public async delete(@Param() params: DeleteFileParams, @Jwt() jwt: JwtPayload): Promise<void> {
		try {
			const deleteFileDto = DeleteFileDto.from(params, jwt);

			await this.fileService.delete(deleteFileDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}
}
