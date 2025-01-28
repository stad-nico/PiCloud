/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Response } from 'express';

import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Logger, Param, Patch, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { IDirectoriesService } from 'src/modules/directories/IDirectoriesService';
import { DirectoryContentDto, DirectoryContentParams, DirectoryContentResponse } from 'src/modules/directories/mapping/content';
import { DirectoryCreateBody, DirectoryCreateDto, DirectoryCreateParams, DirectoryCreateResponse } from 'src/modules/directories/mapping/create';
import { DirectoryDeleteDto, DirectoryDeleteParams } from 'src/modules/directories/mapping/delete';
import { DirectoryDownloadDto, DirectoryDownloadParams } from 'src/modules/directories/mapping/download';
import { DirectoryMetadataDto, DirectoryMetadataParams, DirectoryMetadataResponse } from 'src/modules/directories/mapping/metadata';
import { DirectoryRenameBody, DirectoryRenameDto, DirectoryRenameParams } from 'src/modules/directories/mapping/rename';
import { TemplatedApiException } from 'src/util/SwaggerUtils';
import { DirectoryNameTooLongException } from 'src/modules/directories/exceptions/DirectoryNameTooLongException';
import { InvalidDirectoryNameException } from 'src/modules/directories/exceptions/InvalidDirectoryNameException';
import { ParentDirectoryNotFoundException } from 'src/modules/directories/exceptions/ParentDirectoryNotFoundExceptions';
import { DirectoryAlreadyExistsException } from 'src/modules/directories/exceptions/DirectoryAlreadyExistsException';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';
import { DirectoryNotFoundException } from 'src/modules/directories/exceptions/DirectoryNotFoundException';
import { RootCannotBeRenamedException } from 'src/modules/directories/exceptions/RootCannotBeRenamed';
import { RootCannotBeDeletedException } from 'src/modules/directories/exceptions/RootCannotBeDeletedException';

@Controller('directories')
@ApiTags('directories')
export class DirectoriesController {
	private readonly logger = new Logger(DirectoriesController.name);

	private readonly directoriesService: IDirectoriesService;

	public constructor(@Inject(IDirectoriesService) directoriesService: IDirectoriesService) {
		this.directoriesService = directoriesService;
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

			return await this.directoriesService.create(directoryCreateDto);
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

			return await this.directoriesService.contents(directoryContentDto);
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

			return await this.directoriesService.metadata(directoryMetadataDto);
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

			const result = await this.directoriesService.download(directoryDownloadDto);

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

			await this.directoriesService.rename(directoryRenameDto);
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

			await this.directoriesService.delete(directoryDeleteDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}
}
