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
import { GetDirectoryContentsDto } from 'src/modules/directories/mapping/contents/get-directory-contents.dto';
import { GetDirectoryContentsParams } from 'src/modules/directories/mapping/contents/get-directory-contents.params';
import { GetDirectoryContentsResponse } from 'src/modules/directories/mapping/contents/get-directory-contents.response';
import { CreateDirectoryBody } from 'src/modules/directories/mapping/create/create-directory.body';
import { CreateDirectoryDto } from 'src/modules/directories/mapping/create/create-directory.dto';
import { CreateDirectoryParams } from 'src/modules/directories/mapping/create/create-directory.params';
import { CreateDirectoryResponse } from 'src/modules/directories/mapping/create/create-directory.response';
import { DeleteDirectoryDto } from 'src/modules/directories/mapping/delete/delete-directory.dto';
import { DeleteDirectoryParams } from 'src/modules/directories/mapping/delete/delete-directory.params';
import { DownloadDirectoryDto } from 'src/modules/directories/mapping/download/download-directory.dto';
import { DownloadDirectoryParams } from 'src/modules/directories/mapping/download/download-directory.params';
import { GetDirectoryMetadataParams } from 'src/modules/directories/mapping/metadata/get-directory-metadata.params';
import { GetDirectoryMetadataResponse } from 'src/modules/directories/mapping/metadata/get-directory-metadata.response';
import { RenameDirectoryBody } from 'src/modules/directories/mapping/rename/rename-directory.body';
import { RenameDirectoryDto } from 'src/modules/directories/mapping/rename/rename-directory.dto';
import { RenameDirectoryParams } from 'src/modules/directories/mapping/rename/rename-directory.params';
import { Jwt } from 'src/shared/decorators/jwt.decorator';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';
import { GetDirectoryMetadataDto } from './mapping/metadata/get-directory-metadata.dto';

@Controller('directories')
@DirectoryApiDocs.controller()
export class DirectoriesController {
	private readonly logger = new Logger(DirectoriesController.name);

	public constructor(private readonly directoryService: DirectoryService) {}

	@Post(':id')
	@HttpCode(HttpStatus.CREATED)
	@DirectoryApiDocs.create()
	public async create(
		@Param() createDirectoryParams: CreateDirectoryParams,
		@Body() createDirectoryBody: CreateDirectoryBody,
		@Jwt() jwtPayload: JwtPayload
	): Promise<CreateDirectoryResponse> {
		this.logger.log(`[Post] ${createDirectoryParams.id}`);

		try {
			const createDirectoryDto = CreateDirectoryDto.from(createDirectoryParams, createDirectoryBody, jwtPayload);

			return await this.directoryService.create(createDirectoryDto);
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
		@Param() getDirectoryContentsParams: GetDirectoryContentsParams,
		@Jwt() jwtPayload: JwtPayload
	): Promise<GetDirectoryContentsResponse> {
		this.logger.log(`[Get] ${getDirectoryContentsParams.id}/contents`);

		try {
			const getDirectoryContentsDto = GetDirectoryContentsDto.from(getDirectoryContentsParams, jwtPayload);

			return await this.directoryService.contents(getDirectoryContentsDto);
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
		@Param() getDirectoryMetadataParams: GetDirectoryMetadataParams,
		@Jwt() jwtPayload: JwtPayload
	): Promise<GetDirectoryMetadataResponse> {
		this.logger.log(`[Get] ${getDirectoryMetadataParams.id}/metadata`);

		try {
			const getDirectoryMetadataDto = GetDirectoryMetadataDto.from(getDirectoryMetadataParams, jwtPayload);

			return await this.directoryService.metadata(getDirectoryMetadataDto);
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
		@Param() downloadDirectoryParams: DownloadDirectoryParams,
		@Res({ passthrough: true }) res: Response,
		@Jwt() jwt: JwtPayload
	): Promise<StreamableFile> {
		this.logger.log(`[Get] ${downloadDirectoryParams.id}/download`);

		try {
			const downloadDirectoryDto = DownloadDirectoryDto.from(downloadDirectoryParams, jwt);

			const result = await this.directoryService.download(downloadDirectoryDto);

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
		@Param() renameDirectoryParams: RenameDirectoryParams,
		@Body() renameDirectoryBody: RenameDirectoryBody,
		@Jwt() jwt: JwtPayload
	): Promise<void> {
		this.logger.log(`[Patch] Rename ${renameDirectoryParams.id} to ${renameDirectoryBody.name}`);

		try {
			const renameDirectoryDto = RenameDirectoryDto.from(renameDirectoryParams, renameDirectoryBody, jwt);

			await this.directoryService.rename(renameDirectoryDto);
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
	public async delete(@Param() deleteDirectoryParams: DeleteDirectoryParams, @Jwt() jwt: JwtPayload): Promise<void> {
		this.logger.log(`[Delete] ${deleteDirectoryParams.id}`);

		try {
			const deleteDirectoryDto = DeleteDirectoryDto.from(deleteDirectoryParams, jwt);

			await this.directoryService.delete(deleteDirectoryDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}
}
