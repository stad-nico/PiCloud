/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
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
	Res,
	StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { DirectoryApiDocs } from 'src/modules/directories/directory.api-docs';
import { DirectoryService } from 'src/modules/directories/directory.service';
import { DirectoryContentDto } from 'src/modules/directories/mapping/content/DirectoryContentDto';
import { DirectoryContentParams } from 'src/modules/directories/mapping/content/DirectoryContentParams';
import { DirectoryContentResponse } from 'src/modules/directories/mapping/content/DirectoryContentResponse';
import { DirectoryCreateBody } from 'src/modules/directories/mapping/create/DirectoryCreateBody';
import { DirectoryCreateDto } from 'src/modules/directories/mapping/create/DirectoryCreateDto';
import { DirectoryCreateParams } from 'src/modules/directories/mapping/create/DirectoryCreateParams';
import { DirectoryCreateResponse } from 'src/modules/directories/mapping/create/DirectoryCreateResponse';
import { DirectoryDeleteDto } from 'src/modules/directories/mapping/delete/DirectoryDeleteDto';
import { DirectoryDeleteParams } from 'src/modules/directories/mapping/delete/DirectoryDeleteParams';
import { DirectoryDownloadDto } from 'src/modules/directories/mapping/download/DirectoryDownloadDto';
import { DirectoryDownloadParams } from 'src/modules/directories/mapping/download/DirectoryDownloadParams';
import { DirectoryMetadataDto } from 'src/modules/directories/mapping/metadata/DirectoryMetadataDto';
import { DirectoryMetadataParams } from 'src/modules/directories/mapping/metadata/DirectoryMetadataParams';
import { DirectoryMetadataResponse } from 'src/modules/directories/mapping/metadata/DirectoryMetadataResponse';
import { DirectoryRenameBody } from 'src/modules/directories/mapping/rename/DirectoryRenameBody';
import { DirectoryRenameDto } from 'src/modules/directories/mapping/rename/DirectoryRenameDto';
import { DirectoryRenameParams } from 'src/modules/directories/mapping/rename/DirectoryRenameParams';
import { Jwt } from 'src/shared/decorators/jwt.decorator';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';

@Controller('directories')
@DirectoryApiDocs.controller()
export class DirectoriesController {
	private readonly logger = new Logger(DirectoriesController.name);

	public constructor(private readonly directoryService: DirectoryService) {}

	@Post(':id')
	@HttpCode(HttpStatus.CREATED)
	@DirectoryApiDocs.create()
	public async create(
		@Param() directoryCreateParams: DirectoryCreateParams,
		@Body() directoryCreateBody: DirectoryCreateBody,
		@Jwt() jwtPayload: JwtPayload
	): Promise<DirectoryCreateResponse> {
		this.logger.log(`[Post] ${directoryCreateParams.id}`);

		try {
			const directoryCreateDto = DirectoryCreateDto.from(directoryCreateParams, directoryCreateBody, jwtPayload);

			return await this.directoryService.create(directoryCreateDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get('root')
	@HttpCode(HttpStatus.OK)
	@DirectoryApiDocs.getRoot()
	public async getRoot(@Jwt() jwt: JwtPayload): Promise<{ id: string }> {
		this.logger.log(`[Get] root`);

		try {
			return await this.directoryService.getRoot(jwt.user.id);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Get(':id/contents')
	@HttpCode(HttpStatus.OK)
	@DirectoryApiDocs.getContents()
	public async contents(
		@Param() directoryContentParams: DirectoryContentParams,
		@Jwt() jwtPayload: JwtPayload
	): Promise<DirectoryContentResponse> {
		this.logger.log(`[Get] ${directoryContentParams.id}/content`);

		try {
			const directoryContentDto = DirectoryContentDto.from(directoryContentParams, jwtPayload);

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
	@HttpCode(HttpStatus.OK)
	@DirectoryApiDocs.getMetadata()
	public async metadata(
		@Param() directoryMetadataParams: DirectoryMetadataParams,
		@Jwt() jwtPayload: JwtPayload
	): Promise<DirectoryMetadataResponse> {
		this.logger.log(`[Get] ${directoryMetadataParams.id}/metadata`);

		try {
			const directoryMetadataDto = DirectoryMetadataDto.from(directoryMetadataParams, jwtPayload);

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
	@HttpCode(HttpStatus.OK)
	@DirectoryApiDocs.download()
	public async download(
		@Param() directoryDownloadParams: DirectoryDownloadParams,
		@Res({ passthrough: true }) res: Response,
		@Jwt() jwt: JwtPayload
	): Promise<StreamableFile> {
		this.logger.log(`[Get] ${directoryDownloadParams.id}/download`);

		try {
			const directoryDownloadDto = DirectoryDownloadDto.from(directoryDownloadParams, jwt);

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
	@DirectoryApiDocs.rename()
	public async rename(
		@Param() directoryRenameParams: DirectoryRenameParams,
		@Body() directoryRenameBody: DirectoryRenameBody,
		@Jwt() jwt: JwtPayload
	): Promise<void> {
		this.logger.log(`[Patch] Rename ${directoryRenameParams.id} to ${directoryRenameBody.name}`);

		try {
			const directoryRenameDto = DirectoryRenameDto.from(directoryRenameParams, directoryRenameBody, jwt);

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
	@DirectoryApiDocs.delete()
	public async delete(@Param() directoryDeleteParams: DirectoryDeleteParams, @Jwt() jwt: JwtPayload): Promise<void> {
		this.logger.log(`[Delete] ${directoryDeleteParams.id}`);

		try {
			const directoryDeleteDto = DirectoryDeleteDto.from(directoryDeleteParams, jwt);

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
