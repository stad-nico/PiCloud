import { File } from 'src/api/files/entities/file.entity';

export class FileUploadResponseDto {
	path: string;

	constructor(path: string) {
		this.path = path;
	}

	public static fromFile(file: File): FileUploadResponseDto {
		return new FileUploadResponseDto(file.fullPath);
	}
}
