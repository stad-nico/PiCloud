import { Controller, Delete, Get, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { DirectoryService } from 'src/api/directory/directory.service';
import { DirectoryContentDto } from 'src/api/directory/mapping/content/directory.content.dto';
import { DirectoryContentParams } from 'src/api/directory/mapping/content/directory.content.params';
import { DirectoryContentResponse } from 'src/api/directory/mapping/content/directory.content.response';
import { DirectoryCreateDto } from 'src/api/directory/mapping/create/directory.create.dto';
import { DirectoryCreateParams } from 'src/api/directory/mapping/create/directory.create.params';
import { DirectoryCreateResponse } from 'src/api/directory/mapping/create/directory.create.response';
import { DirectoryDeleteDto } from 'src/api/directory/mapping/delete/directory.delete.dto';
import { DirectoryDeleteParams } from 'src/api/directory/mapping/delete/directory.delete.params';
import { DirectoryDeleteResponse } from 'src/api/directory/mapping/delete/directory.delete.response';
import { DirectoryMetadataDto } from 'src/api/directory/mapping/metadata/directory.metadata.dto';
import { DirectoryMetadataParams } from 'src/api/directory/mapping/metadata/directory.metadata.params';
import { DirectoryMetadataResponse } from 'src/api/directory/mapping/metadata/directory.metadata.response';
import { ServerError } from 'src/util/ServerError';

@Controller('directory')
export class DirectoryController {
	private readonly logger = new Logger(DirectoryController.name);

	private readonly directoryService: DirectoryService;

	constructor(directoryService: DirectoryService) {
		this.directoryService = directoryService;
	}

	@Get(':path(*)/content')
	public async content(@Param() directoryContentParams: DirectoryContentParams): Promise<DirectoryContentResponse> {
		this.logger.log(`[Get] ${directoryContentParams.path}/content`);

		try {
			const directoryContentDto = DirectoryContentDto.from(directoryContentParams);

			return await this.directoryService.content(directoryContentDto);
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

	// @Get(':path(*)/download')
	// public async download(
	// 	@Param() directoryDownloadParams: DirectoryDownloadParams,
	// 	@Res({ passthrough: true }) res: Response
	// ): Promise<StreamableFile> {
	// 	this.logger.log(`[Get] ${directoryDownloadParams.path}/download`);

	// 	try {
	// 		const directoryDownloadDto = DirectoryDownloadDto.from(directoryDownloadParams);

	// 		// const result = await this.directoryService.download(directoryDownloadDto);

	// 		// res.header({
	// 		// 	'Content-Type': result.mimeType,
	// 		// 	'Content-Disposition': `attachment; filename=${result.name}`,
	// 		// });

	// 		// return new StreamableFile(result.readable);

	// 		return 0 as any;
	// 	} catch (e) {
	// 		if (e instanceof ServerError) {
	// 			this.logger.error(e.message);
	// 			throw e.toHttpException();
	// 		} else {
	// 			this.logger.error(e);
	// 			throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
	// 		}
	// 	}
	// }

	@Get(':path(*)/metadata')
	public async metadata(@Param() directoryMetadataParams: DirectoryMetadataParams): Promise<DirectoryMetadataResponse> {
		this.logger.log(`[Get] ${directoryMetadataParams.path}/metadata`);

		try {
			const directoryMetadataDto = DirectoryMetadataDto.from(directoryMetadataParams);

			return await this.directoryService.metadata(directoryMetadataDto);
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
	public async create(@Param() directoryCreateParams: DirectoryCreateParams): Promise<DirectoryCreateResponse> {
		this.logger.log(`[Post] ${directoryCreateParams.path}`);

		try {
			const directoryCreateDto = DirectoryCreateDto.from(directoryCreateParams);

			return await this.directoryService.create(directoryCreateDto);
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

	// @Patch(':path(*)')
	// public async rename(
	// 	@Param() directoryRenameParams: DirectoryRenameParams,
	// 	@Body() directoryRenameBody: DirectoryRenameBody
	// ): Promise<DirectoryRenameResponse> {
	// 	this.logger.log(`[Patch] ${directoryRenameParams.path} to ${directoryRenameBody.newPath}`);

	// 	try {
	// 		const directoryRenameDto = DirectoryRenameDto.from(directoryRenameParams, directoryRenameBody);

	// 		// return await this.directoryService.rename(directoryRenameDto);
	// 		return 0 as any;
	// 	} catch (e) {
	// 		if (e instanceof ServerError) {
	// 			this.logger.error(e.message);
	// 			throw e.toHttpException();
	// 		} else {
	// 			this.logger.error(e);
	// 			throw new ServerError('something went wrong', HttpStatus.INTERNAL_SERVER_ERROR).toHttpException();
	// 		}
	// 	}
	// }

	@Delete(':path(*)')
	public async delete(@Param() directoryDeleteParams: DirectoryDeleteParams): Promise<DirectoryDeleteResponse> {
		this.logger.log(`[Delete] ${directoryDeleteParams.path}`);
		try {
			const directoryDeleteDto = DirectoryDeleteDto.from(directoryDeleteParams);

			return await this.directoryService.delete(directoryDeleteDto);
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
