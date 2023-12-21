import { File } from 'src/db/entities/File';

export class FileRestoreResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(file: File): FileRestoreResponse {
		return new FileRestoreResponse(file.fullPath);
	}
}
