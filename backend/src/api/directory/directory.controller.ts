import { Controller, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { DirectoryService } from 'src/api/directory/directory.service';
import { DirectoryCreateDto } from 'src/api/directory/mapping/create/directory.create.dto';
import { DirectoryCreateParams } from 'src/api/directory/mapping/create/directory.create.params';
import { ServerError } from 'src/util/ServerError';

@Controller('directory')
export class DirectoryController {
	private readonly logger = new Logger(DirectoryController.name);

	private readonly directoryService: DirectoryService;

	constructor(directoryService: DirectoryService) {
		this.directoryService = directoryService;
	}

	@Post(':path(*)')
	public async create(@Param() directoryCreateParams: DirectoryCreateParams) {
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
}
