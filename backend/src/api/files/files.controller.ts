import { BadRequestException, Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from 'src/api/files/dtos/file.upload.dto';
import { FileUploadResponseDto } from 'src/api/files/dtos/file.upload.response.dto';
import { FileUploadEntity } from 'src/api/files/entities/file.upload.entity';
import { FilesService } from 'src/api/files/files.service';
import { ILogger } from 'src/logging/ILogger';
import { InjectLogger } from 'src/logging/InjectLogger';
import { ServerError } from 'src/util/ServerError';

@Controller('files')
export class FilesController {
	private readonly filesService: FilesService;

	private readonly configService: ConfigService;

	@InjectLogger()
	private readonly logger!: ILogger;

	constructor(fileService: FilesService, configService: ConfigService) {
		this.filesService = fileService;
		this.configService = configService;
	}

	@Post(':path(*)')
	@UseInterceptors(FileInterceptor('file'))
	public async upload(@Param() params: FileUploadDto, @UploadedFile() file: Express.Multer.File): Promise<FileUploadResponseDto> {
		let fullPath: string = params.path;

		if (!file) {
			throw new BadRequestException('file must not be empty');
		}

		this.logger.log(`[POST] Upload file ${fullPath}`);

		let fileUploadEntity: FileUploadEntity = FileUploadEntity.from(fullPath, file);

		let result = await this.filesService.upload(fileUploadEntity);

		if (result instanceof ServerError) {
			this.logger.error(`[RES] ${result.message}`);
			throw result.toHttpException();
		}

		this.logger.log(`[RES] ${FileUploadResponseDto.fromFile(result).path}`);
		return FileUploadResponseDto.fromFile(result);
	}
}
