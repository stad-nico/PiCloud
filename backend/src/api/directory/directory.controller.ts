import { Controller, Logger } from '@nestjs/common';
import { DirectoryService } from 'src/api/directory/directory.service';

@Controller('directory')
export class DirectoryController {
	private readonly logger = new Logger(DirectoryController.name);

	private readonly directoryService: DirectoryService;

	constructor(directoryService: DirectoryService) {
		this.directoryService = directoryService;
	}
}
