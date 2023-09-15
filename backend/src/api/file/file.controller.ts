import { Controller, Get, Inject, Post } from '@nestjs/common';

@Controller('file')
export class FileController {
	private jobQueueService: JobQueueService;

	public constructor(@Inject() jobQueueService: JobQueueService) {
		this.jobQueueService = jobQueueService;
	}

	@Get('/:path/download')
	public async download() {}

	@Post('/:path/')
	public async upload() {}
}
