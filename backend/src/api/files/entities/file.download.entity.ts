import { FileDownloadDto } from 'src/api/files/dtos/file.download.dto';

export class FileDownloadEntity {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(fileDownloadDto: FileDownloadDto): FileDownloadEntity {
		return new FileDownloadEntity(fileDownloadDto.path);
	}
}
