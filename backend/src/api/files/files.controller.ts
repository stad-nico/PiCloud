import { Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from 'src/api/files/dtos/file.upload.dto';
import { FileUploadResponseDto } from 'src/api/files/dtos/file.upload.response.dto';
import { File } from 'src/api/files/entities/file.entity';
import { FileUploadEntity } from 'src/api/files/entities/file.upload.entity';
import { FilesService } from 'src/api/files/files.service';
import { ILogger } from 'src/logging/ILogger';
import { InjectLogger } from 'src/logging/InjectLogger';
import { Error } from 'src/util/Error';

@Controller('files')
export class FilesController {
	private filesService: FilesService;

	@InjectLogger()
	private logger!: ILogger;

	constructor(fileService: FilesService) {
		this.filesService = fileService;
	}

	@Post(':path(*)')
	@UseInterceptors(FileInterceptor('file'))
	public async update(@Param() params: FileUploadDto, @UploadedFile() file: Express.Multer.File): Promise<FileUploadResponseDto> {
		let fullPath: string = params.path;

		this.logger.log(`[POST] Upload file ${fullPath}`);

		let fileUploadEntity: FileUploadEntity = FileUploadEntity.from(fullPath, file);

		let result: File | Error = await this.filesService.upload(fileUploadEntity);

		if (result instanceof Error) {
			this.logger.error(`[RES] ${result.getMessage()}`);
			throw result.toHttpException();
		}

		this.logger.log(`[RES] ${FileUploadResponseDto.fromFile(result).path}`);
		return FileUploadResponseDto.fromFile(result);
	}
}
