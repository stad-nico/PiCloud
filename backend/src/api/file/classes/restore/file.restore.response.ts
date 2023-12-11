import { File } from 'src/api/file/entities/file.entity';

export class FileRestoreResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(file: File): FileRestoreResponse {
		return new FileRestoreResponse(file.fullPath);
	}
}
