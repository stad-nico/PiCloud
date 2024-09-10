/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Response } from 'express';

import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Logger, Param, Patch, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { IDirectoryService } from 'src/api/directory/IDirectoryService';
import { DirectoryContentDto, DirectoryContentParams, DirectoryContentResponse } from 'src/api/directory/mapping/content';
import { DirectoryCreateBody, DirectoryCreateDto, DirectoryCreateParams, DirectoryCreateResponse } from 'src/api/directory/mapping/create';
import { DirectoryDeleteDto, DirectoryDeleteParams } from 'src/api/directory/mapping/delete';
import { DirectoryDownloadDto, DirectoryDownloadParams } from 'src/api/directory/mapping/download';
import { DirectoryMetadataDto, DirectoryMetadataParams, DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata';
import { DirectoryRenameBody, DirectoryRenameDto, DirectoryRenameParams } from 'src/api/directory/mapping/rename';
import {
	DirectoryAlreadyExistsException,
	DirectoryNameTooLongException,
	DirectoryNotFoundException,
	InvalidDirectoryNameException,
	ParentDirectoryNotFoundException,
	RootCannotBeDeletedException,
	RootCannotBeRenamedException,
	SomethingWentWrongException,
} from 'src/exceptions';
import { TemplatedApiException } from 'src/util/SwaggerUtils';

@Controller('directories')
@ApiTags('directories')
export class DirectoryController {
	private readonly logger = new Logger(DirectoryController.name);

	private readonly directoryService: IDirectoryService;

	public constructor(@Inject(IDirectoryService) directoryService: IDirectoryService) {
		this.directoryService = directoryService;
	}

	@Post(':id')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		operationId: 'create',
		summary: 'Create directory',
		description: 'Create a directory with the given name under the given parent id',
	})
	@ApiCreatedResponse({ description: 'The directory was created successfully' })
	@TemplatedApiException(() => new DirectoryNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName'), {
		description: 'The directory name is too long',
	})
	@TemplatedApiException(() => new InvalidDirectoryNameException('%&/("§.*'), { description: 'The directory name is not valid' })
	@TemplatedApiException(() => new ParentDirectoryNotFoundException('133a8736-111a-4cf7-ae84-dbe040ad4382'), {
		description: 'The parent directory does not exist',
	})
	@TemplatedApiException(() => new DirectoryAlreadyExistsException('example'), { description: 'The directory already exists' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async create(
		@Param() directoryCreateParams: DirectoryCreateParams,
		@Body() directoryCreateBody: DirectoryCreateBody
	): Promise<DirectoryCreateResponse> {
		this.logger.log(`[Post] ${directoryCreateParams.id}`);

		try {
			const directoryCreateDto = DirectoryCreateDto.from(directoryCreateParams, directoryCreateBody);

			return await this.directoryService.create(directoryCreateDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get(':id/contents')
	@ApiOperation({ operationId: 'getContents', summary: 'Get directory contents', description: 'Get the files and directories' })
	@ApiOkResponse({ type: DirectoryContentResponse, description: 'The contents were retrieved successfully' })
	@TemplatedApiException(() => new DirectoryNotFoundException('133a8736-111a-4cf7-ae84-dbe040ad4382'), { description: 'The directory does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async contents(@Param() directoryContentParams: DirectoryContentParams): Promise<DirectoryContentResponse> {
		this.logger.log(`[Get] ${directoryContentParams.id}/content`);

		try {
			const directoryContentDto = DirectoryContentDto.from(directoryContentParams);

			return await this.directoryService.contents(directoryContentDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get(':id/metadata')
	@ApiOperation({ operationId: 'getMetadata', summary: 'Get directory metadata', description: 'Get the metadata of a directory' })
	@ApiOkResponse({ type: DirectoryMetadataResponse, description: 'The metadata was retrieved successfully' })
	@TemplatedApiException(() => new DirectoryNotFoundException('133a8736-111a-4cf7-ae84-dbe040ad4382'), { description: 'The directory does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async metadata(@Param() directoryMetadataParams: DirectoryMetadataParams): Promise<DirectoryMetadataResponse> {
		this.logger.log(`[Get] ${directoryMetadataParams.id}/metadata`);

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

	@Get(':id/download')
	@ApiOperation({ operationId: 'download', summary: 'Download directory', description: 'Download the directory as a ZIP archive' })
	@ApiOkResponse({ content: { '*/*': { schema: { type: 'string', format: 'binary' } } }, description: 'The directory was downloaded successfully' })
	@TemplatedApiException(() => new DirectoryNotFoundException('133a8736-111a-4cf7-ae84-dbe040ad4382'), { description: 'The directory does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async download(@Param() directoryDownloadParams: DirectoryDownloadParams, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
		this.logger.log(`[Get] ${directoryDownloadParams.id}/download`);

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

	@Patch(':id/rename')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ operationId: 'rename', summary: 'Rename directory', description: 'Rename or move a directory' })
	@ApiNoContentResponse({ description: 'The directory was renamed successfully' })
	@TemplatedApiException(() => new InvalidDirectoryNameException('%26path&'), { description: 'The directory name is not valid' })
	@TemplatedApiException(() => new DirectoryNameTooLongException('thisNameIsWayTooLongSoYouWillReceiveAnErrorIfYouChooseSuchALongName'), {
		description: 'The directory name is too long',
	})
	@TemplatedApiException(() => RootCannotBeRenamedException, { description: 'The root directory cannot be renamed' })
	@TemplatedApiException(() => new ParentDirectoryNotFoundException('133a8736-111a-4cf7-ae84-dbe040ad4382'), {
		description: 'The parent directory does not exist',
	})
	@TemplatedApiException(() => new DirectoryNotFoundException('9bb14df7-112b-486a-bd49-8261246ad256'), { description: 'The directory does not exist' })
	@TemplatedApiException(() => new DirectoryAlreadyExistsException('renamed'), { description: 'The destination directory already exists' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async rename(@Param() directoryRenameParams: DirectoryRenameParams, @Body() directoryRenameBody: DirectoryRenameBody): Promise<void> {
		this.logger.log(`[Patch] Rename ${directoryRenameParams.id} to ${directoryRenameBody.name}`);

		try {
			const directoryRenameDto = DirectoryRenameDto.from(directoryRenameParams, directoryRenameBody);

			await this.directoryService.rename(directoryRenameDto);
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
	@ApiOperation({
		operationId: 'delete',
		summary: 'Delete directory',
		description: 'Delete the directory with the given id including all files and subdirectories',
	})
	@ApiNoContentResponse({ description: 'The directory was deleted successfully' })
	@TemplatedApiException(() => RootCannotBeDeletedException, { description: 'The root directory cannot be deleted' })
	@TemplatedApiException(() => new DirectoryNotFoundException('9bb14df7-112b-486a-bd49-8261246ad256'), { description: 'The directory does not exist' })
	@TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
	public async delete(@Param() directoryDeleteParams: DirectoryDeleteParams): Promise<void> {
		this.logger.log(`[Delete] ${directoryDeleteParams.id}`);
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
