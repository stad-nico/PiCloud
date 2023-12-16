import { Controller, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { CreateDirectoryDto } from 'src/api/directory/classes/create/CreateDirectoryDto';
import { CreateDirectoryParams } from 'src/api/directory/classes/create/CreateDirectoryParams';
import { CreateDirectoryResponse } from 'src/api/directory/classes/create/CreateDirectoryResponse';
import { DirectoryService } from 'src/api/directory/directory.service';
import { ServerError } from 'src/util/ServerError';

@Controller('directory')
export class DirectoryController {
	private readonly logger = new Logger(DirectoryController.name);

	private readonly directoryService: DirectoryService;

	constructor(directoryService: DirectoryService) {
		this.directoryService = directoryService;
	}

	@Post(':path(*)')
	async create(@Param() createDirectoryParams: CreateDirectoryParams): Promise<CreateDirectoryResponse> {
		try {
			const createDirectoryDto = CreateDirectoryDto.from(createDirectoryParams);

			return await this.directoryService.create(createDirectoryDto);
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
