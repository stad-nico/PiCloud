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
	HttpException,
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
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { IFileService } from 'src/api/file/IFileService';
import { FileDeleteDto, FileDeleteParams } from 'src/api/file/mapping/delete';
import { FileDownloadDto, FileDownloadParams } from 'src/api/file/mapping/download';
import { FileMetadataDto, FileMetadataParams, FileMetadataResponse } from 'src/api/file/mapping/metadata';
import { FileRenameBody, FileRenameDto, FileRenameParams, FileRenameResponse } from 'src/api/file/mapping/rename';
import { FileReplaceDto, FileReplaceParams, FileReplaceResponse } from 'src/api/file/mapping/replace';
import { FileUploadDto, FileUploadParams, FileUploadResponse } from 'src/api/file/mapping/upload';
import { FileAlreadyExistsException } from 'src/exceptions/FileAlreadyExistsException';
import { FileNameTooLongException } from 'src/exceptions/FileNameTooLongException';
import { FileNotFoundException } from 'src/exceptions/FileNotFoundException';
import { InvalidFilePathException } from 'src/exceptions/InvalidFilePathException';
import { ParentDirectoryNotFoundException } from 'src/exceptions/ParentDirectoryNotFoundExceptions';
import { SomethingWentWrongException } from 'src/exceptions/SomethingWentWrongException';
import { TemplatedApiException } from 'src/util/SwaggerUtils';

@Controller('file')
@ApiTags('file')
export class FileController {
	private readonly logger = new Logger(FileController.name);

	private readonly fileService: IFileService;

	public constructor(@Inject(IFileService) fileService: IFileService) {
		this.fileService = fileService;
	}

	@Post(':path(*)')
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({ summary: 'Upload file', description: 'Upload a file and store it under the provided path' })
	@ApiCreatedResponse({ type: FileUploadResponse, description: 'Success' })
	@TemplatedApiException(() => new FileNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName.txt'), {
		description: 'The file name is too long',
	})
	@TemplatedApiException(() => new InvalidFilePathException('/invalid%/file&.txt'), { description: 'The file path is not valid' })
	@TemplatedApiException(() => new ParentDirectoryNotFoundException('/path/to'), { description: 'The parent directory does not exist' })
	@TemplatedApiException(() => new FileAlreadyExistsException('/path/to/file.txt'), { description: 'The file already exists' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async upload(@Param() params: FileUploadParams, @UploadedFile() file: Express.Multer.File): Promise<FileUploadResponse> {
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

	@Put(':path(*)')
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({ summary: 'Replace file', description: 'Replace the file at the given path with new file' })
	@ApiCreatedResponse({ type: FileUploadResponse, description: 'Success' })
	@TemplatedApiException(() => new FileNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName.txt'), {
		description: 'The file name is too long',
	})
	@TemplatedApiException(() => new InvalidFilePathException('/invalid%/file&.txt'), { description: 'The file path is not valid' })
	@TemplatedApiException(() => new ParentDirectoryNotFoundException('/path/to'), { description: 'The parent directory does not exist' })
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

	@Get(':path(*)/metadata')
	@ApiOperation({ summary: 'Get file metadata', description: 'Get the detailed metadata of a file' })
	@ApiOkResponse({ type: FileMetadataResponse, description: 'Success' })
	@TemplatedApiException(() => new FileNotFoundException('/path/to/file.txt'), { description: 'The file does not exist' })
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

	@Get(':path(*)/download')
	@ApiOperation({ summary: 'Download file', description: 'Download the file at the given path' })
	@ApiOkResponse({ content: { '*/*': { schema: { type: 'string', format: 'binary' } } }, description: 'Success' })
	@TemplatedApiException(() => new FileNotFoundException('/path/to/file.txt'), { description: 'The file does not exist' })
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

	@Patch(':path(*)')
	@ApiOperation({ summary: 'Rename file', description: 'Rename or move a file' })
	@ApiOkResponse({ type: FileRenameResponse, description: 'Success' })
	@TemplatedApiException(() => new FileNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName.txt'), {
		description: 'The file name is too long',
	})
	@TemplatedApiException(() => new InvalidFilePathException('/new/invalid%/path&.txt'), { description: 'The file path is not valid' })
	@TemplatedApiException(() => new ParentDirectoryNotFoundException('/new/'), { description: 'The destination parent directory does not exist' })
	@TemplatedApiException(() => new FileNotFoundException('/path/to/file.txt'), { description: 'The file does not exist' })
	@TemplatedApiException(() => new FileAlreadyExistsException('/new/file.txt'), { description: 'The destination file already exists' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async rename(@Param() params: FileRenameParams, @Body() body: FileRenameBody): Promise<FileRenameResponse> {
		try {
			const fileRenameDto = FileRenameDto.from(params, body);

			return await this.fileService.rename(fileRenameDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Delete(':path(*)')
	@ApiOperation({ summary: 'Delete file', description: 'Delete the file at the given path' })
	@ApiNoContentResponse({ description: 'Success' })
	@TemplatedApiException(() => new FileNotFoundException('/path/to/file.txt'), { description: 'The file does not exist' })
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
