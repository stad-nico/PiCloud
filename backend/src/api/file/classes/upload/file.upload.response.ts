import { File } from 'src/db/entities/File';

export class FileUploadResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static fromFile(file: File): FileUploadResponse {
		return new FileUploadResponse(file.fullPath);
	}
}
