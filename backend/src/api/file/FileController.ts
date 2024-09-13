/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
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
	Inject,
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
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { IFileService } from 'src/api/file/IFileService';
import { FileDeleteDto, FileDeleteParams } from 'src/api/file/mapping/delete';
import { FileDownloadDto, FileDownloadParams } from 'src/api/file/mapping/download';
import { FileMetadataDto, FileMetadataParams, FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileRenameBody, FileRenameDto, FileRenameParams } from 'src/api/file/mapping/rename';
import { FileReplaceDto, FileReplaceParams, FileReplaceResponse } from 'src/api/file/mapping/replace';
import { FileUploadBody, FileUploadDto, FileUploadParams, FileUploadResponse } from 'src/api/file/mapping/upload';
import {
	FileAlreadyExistsException,
	FileNameTooLongException,
	FileNotFoundException,
	InvalidFileNameException,
	ParentDirectoryNotFoundException,
	SomethingWentWrongException,
} from 'src/exceptions';
import { TemplatedApiException } from 'src/util/SwaggerUtils';

@Controller('directories')
@ApiTags('files')
export class FileController {
	private readonly logger = new Logger(FileController.name);

	private readonly fileService: IFileService;

	public constructor(@Inject(IFileService) fileService: IFileService) {
		this.fileService = fileService;
	}

	@Post(':id/files')
	@UseInterceptors(FileInterceptor('file'))
	@ApiConsumes('multipart/form-data')
	@ApiBody({ description: 'File to upload', type: FileUploadBody })
	@ApiOperation({ operationId: 'upload', summary: 'Upload file', description: 'Upload a file and store it under the provided parent id' })
	@ApiCreatedResponse({ type: FileUploadResponse, description: 'The file was created successfully' })
	@TemplatedApiException(() => new FileNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName.txt'), {
		description: 'The file name is too long',
	})
	@TemplatedApiException(() => new InvalidFileNameException('&/8892mf--+&.txt'), { description: 'The file path is not valid' })
	@TemplatedApiException(() => new ParentDirectoryNotFoundException('3c356389-dd1a-4c77-bc1b-7ac75f34d04d'), {
		description: 'The parent directory does not exist',
	})
	@TemplatedApiException(() => new FileAlreadyExistsException('example.txt'), { description: 'The file already exists' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async upload(@Param() params: FileUploadParams, @UploadedFile() file: Express.Multer.File): Promise<FileUploadResponse> {
		this.logger.log(`[Upload File] ${params.id}`);

		try {
			const fileUploadDto = FileUploadDto.from(params, file);

			return await this.fileService.upload(fileUploadDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Put(':id/files')
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({ operationId: 'replace', summary: 'Replace file', description: 'Upload a file and replace if it already exists' })
	@ApiCreatedResponse({ type: FileUploadResponse, description: 'The file was replaced successfully' })
	@TemplatedApiException(() => new FileNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName.txt'), {
		description: 'The file name is too long',
	})
	@TemplatedApiException(() => new InvalidFileNameException('+.-34/.'), { description: 'The file path is not valid' })
	@TemplatedApiException(() => new ParentDirectoryNotFoundException('3c356389-dd1a-4c77-bc1b-7ac75f34d04d'), {
		description: 'The parent directory does not exist',
	})
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async replace(@Param() params: FileReplaceParams, @UploadedFile() file: Express.Multer.File): Promise<FileReplaceResponse> {
		try {
			const fileReplaceDto = FileReplaceDto.from(params, file);

			return await this.fileService.replace(fileReplaceDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get(':directoryId/files/:id/metadata')
	@ApiOperation({ operationId: 'getFileMetadata', summary: 'Get file metadata', description: 'Get the metadata of a file with the given id' })
	@ApiOkResponse({ type: FileMetadataResponse, description: 'The metadata was retrieved successfully' })
	@TemplatedApiException(() => new FileNotFoundException('3c356389-dd1a-4c77-bc1b-7ac75f34d04d'), { description: 'The file does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async metadata(@Param() params: FileMetadataParams): Promise<FileMetadataResponse> {
		try {
			const fileMetadataDto = FileMetadataDto.from(params);

			return await this.fileService.metadata(fileMetadataDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get(':directoryId/files/:id/download')
	@ApiOperation({ operationId: 'downloadFile', summary: 'Download file', description: 'Download a file with the given id' })
	@ApiOkResponse({ content: { '*/*': { schema: { type: 'string', format: 'binary' } } }, description: 'The file was downloaded successfully' })
	@TemplatedApiException(() => new FileNotFoundException('3c356389-dd1a-4c77-bc1b-7ac75f34d04d'), { description: 'The file does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
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
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Patch(':directoryId/files/:id/rename')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ operationId: 'renameFile', summary: 'Rename file', description: 'Rename the file with the given id' })
	@ApiNoContentResponse({ description: 'The file was renamed successfully' })
	@TemplatedApiException(() => new FileNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName.txt'), {
		description: 'The file name is too long',
	})
	@TemplatedApiException(() => new InvalidFileNameException('/$()§..fw'), { description: 'The file name is not valid' })
	@TemplatedApiException(() => new ParentDirectoryNotFoundException('3c356389-dd1a-4c77-bc1b-7ac75f34d04d'), {
		description: 'The parent directory does not exist',
	})
	@TemplatedApiException(() => new FileNotFoundException('853d4b18-8d1a-426c-b53e-74027ce1644b'), { description: 'The file does not exist' })
	@TemplatedApiException(() => new FileAlreadyExistsException('example.txt'), { description: 'The file already exists' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async rename(@Param() params: FileRenameParams, @Body() body: FileRenameBody): Promise<void> {
		try {
			const fileRenameDto = FileRenameDto.from(params, body);

			await this.fileService.rename(fileRenameDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Delete(':directoryId/files/:id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ operationId: 'deleteFile', summary: 'Delete file', description: 'Delete the file with the given id' })
	@ApiNoContentResponse({ description: 'The file was deleted successfully' })
	@TemplatedApiException(() => new FileNotFoundException('853d4b18-8d1a-426c-b53e-74027ce1644b'), { description: 'The file does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async delete(@Param() params: FileDeleteParams): Promise<void> {
		try {
			const fileDeleteDto = FileDeleteDto.from(params);

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
