import { Response } from 'express';

import { Body, Controller, Delete, Get, HttpException, Inject, Logger, Param, Patch, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { IDirectoryService } from 'src/api/directory/IDirectoryService';
import { DirectoryContentDto, DirectoryContentParams, DirectoryContentResponse } from 'src/api/directory/mapping/content';
import { DirectoryCreateDto, DirectoryCreateParams, DirectoryCreateResponse } from 'src/api/directory/mapping/create';
import { DirectoryDeleteDto, DirectoryDeleteParams } from 'src/api/directory/mapping/delete';
import { DirectoryDownloadDto, DirectoryDownloadParams } from 'src/api/directory/mapping/download';
import { DirectoryMetadataDto, DirectoryMetadataParams, DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata';
import { DirectoryRenameBody, DirectoryRenameDto, DirectoryRenameParams, DirectoryRenameResponse } from 'src/api/directory/mapping/rename';
import { DirectoryAlreadyExistsException } from 'src/exceptions/DirectoryAlreadyExistsException';
import { DirectoryNameTooLongException } from 'src/exceptions/DirectoryNameTooLongException';
import { DirectoryNotFoundException } from 'src/exceptions/DirectoryNotFoundException';
import { InvalidDirectoryPathException } from 'src/exceptions/InvalidDirectoryPathException';
import { ParentDirectoryNotFoundException } from 'src/exceptions/ParentDirectoryNotFoundExceptions';
import { SomethingWentWrongException } from 'src/exceptions/SomethingWentWrongException';
import { TemplatedApiException } from 'src/util/SwaggerUtils';

@Controller('directory')
@ApiTags('directory')
export class DirectoryController {
	private readonly logger = new Logger(DirectoryController.name);

	private readonly directoryService: IDirectoryService;

	public constructor(@Inject(IDirectoryService) directoryService: IDirectoryService) {
		this.directoryService = directoryService;
	}

	@Post(':path(*)')
	@ApiOperation({ summary: 'Create directory', description: 'Create a directory at the provided path' })
	@ApiCreatedResponse({ type: DirectoryCreateResponse, description: 'Success' })
	@TemplatedApiException(() => new DirectoryNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName'), {
		description: 'The directory name is too long',
	})
	@TemplatedApiException(() => new InvalidDirectoryPathException('/invalid%/path&'), { description: 'The directory path is not valid' })
	@TemplatedApiException(() => new ParentDirectoryNotFoundException('/path/to'), { description: 'The parent directory does not exist' })
	@TemplatedApiException(() => new DirectoryAlreadyExistsException('/path/to/directory'), { description: 'The directory already exists' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async create(@Param() directoryCreateParams: DirectoryCreateParams): Promise<DirectoryCreateResponse> {
		this.logger.log(`[Post] ${directoryCreateParams.path}`);

		try {
			const directoryCreateDto = DirectoryCreateDto.from(directoryCreateParams);

			return await this.directoryService.create(directoryCreateDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get(':path(*)/content')
	@ApiOperation({ summary: 'Get directory contents', description: 'Get the files and subdirectories on the first level' })
	@ApiOkResponse({ type: DirectoryContentResponse, description: 'Success' })
	@TemplatedApiException(() => new DirectoryNotFoundException('/path/to/directory'), { description: 'The directory does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async content(@Param() directoryContentParams: DirectoryContentParams): Promise<DirectoryContentResponse> {
		this.logger.log(`[Get] ${directoryContentParams.path}/content`);

		try {
			const directoryContentDto = DirectoryContentDto.from(directoryContentParams);

			return await this.directoryService.content(directoryContentDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get(':path(*)/metadata')
	@ApiOperation({ summary: 'Get directory metadata', description: 'Get the detailed metadata of a directory' })
	@ApiOkResponse({ type: DirectoryMetadataResponse, description: 'Success' })
	@TemplatedApiException(() => new DirectoryNotFoundException('/path/to/directory'), { description: 'The directory does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async metadata(@Param() directoryMetadataParams: DirectoryMetadataParams): Promise<DirectoryMetadataResponse> {
		this.logger.log(`[Get] ${directoryMetadataParams.path}/metadata`);

		try {
			const directoryMetadataDto = DirectoryMetadataDto.from(directoryMetadataParams);

			return await this.directoryService.metadata(directoryMetadataDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get(':path(*)/download')
	@ApiOperation({ summary: 'Download directory', description: 'Download the directory as a ZIP archive' })
	@ApiOkResponse({ content: { '*/*': { schema: { type: 'string', format: 'binary' } } }, description: 'Success' })
	@TemplatedApiException(() => new DirectoryNotFoundException('/path/to/directory'), { description: 'The directory does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async download(@Param() directoryDownloadParams: DirectoryDownloadParams, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
		this.logger.log(`[Get] ${directoryDownloadParams.path}/download`);

		try {
			const directoryDownloadDto = DirectoryDownloadDto.from(directoryDownloadParams);

			const result = await this.directoryService.download(directoryDownloadDto);

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
	@ApiOperation({ summary: 'Rename directory', description: 'Rename or move a directory' })
	@ApiOkResponse({ type: DirectoryRenameResponse, description: 'Success' })
	@TemplatedApiException(() => new DirectoryNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName'), {
		description: 'The directory name is too long',
	})
	@TemplatedApiException(() => new InvalidDirectoryPathException('/new/invalid%/path&'), { description: 'The directory path is not valid' })
	@TemplatedApiException(() => new ParentDirectoryNotFoundException('/new/'), { description: 'The destination parent directory does not exist' })
	@TemplatedApiException(() => new DirectoryNotFoundException('/path/to/directory'), { description: 'The directory does not exist' })
	@TemplatedApiException(() => new DirectoryAlreadyExistsException('/new/'), { description: 'The destination directory already exists' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async rename(
		@Param() directoryRenameParams: DirectoryRenameParams,
		@Body() directoryRenameBody: DirectoryRenameBody
	): Promise<DirectoryRenameResponse> {
		this.logger.log(`[Patch] ${directoryRenameParams.path} to ${directoryRenameBody.newPath}`);

		try {
			const directoryRenameDto = DirectoryRenameDto.from(directoryRenameParams, directoryRenameBody);

			return await this.directoryService.rename(directoryRenameDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Delete(':path(*)')
	@ApiOperation({ summary: 'Delete directory', description: 'Delete the directory at the given path including all files and subdirectories' })
	@ApiNoContentResponse({ description: 'Success' })
	@TemplatedApiException(() => new DirectoryNotFoundException('/path/to/directory'), { description: 'The directory does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async delete(@Param() directoryDeleteParams: DirectoryDeleteParams): Promise<void> {
		this.logger.log(`[Delete] ${directoryDeleteParams.path}`);
		try {
			const directoryDeleteDto = DirectoryDeleteDto.from(directoryDeleteParams);

			await this.directoryService.delete(directoryDeleteDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}
}
