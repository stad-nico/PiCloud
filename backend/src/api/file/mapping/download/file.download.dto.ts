import { FileDownloadParams } from 'src/api/file/classes/download/file.download.params';

export class FileDownloadDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(fileDownloadParams: FileDownloadParams): FileDownloadDto {
		return new FileDownloadDto(fileDownloadParams.path);
	}
}
