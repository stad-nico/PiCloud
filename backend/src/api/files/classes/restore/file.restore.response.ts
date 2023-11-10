import { File } from 'src/api/files/entities/file.entity';

export class FileRestoreResponse {
	readonly path: string;

	constructor(path: string) {
		this.path = path;
	}

	public static from(file: File): FileRestoreResponse {
		return new FileRestoreResponse(file.fullPath);
	}
}
