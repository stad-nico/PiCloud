import { File } from 'src/api/files/entities/file.entity';

export class FilePostResponseDto {
	path: string;

	constructor(path: string) {
		this.path = path;
	}

	public static fromFile(file: File): FilePostResponseDto {
		return new FilePostResponseDto(file.fullPath);
	}
}
