import { File } from 'src/api/files/entities/file.entity';

export class FileRenameResponse {
	readonly path: string;

	constructor(path: string) {
		this.path = path;
	}

	public static from(file: File): FileRenameResponse {
		return new FileRenameResponse(file.fullPath);
	}
}
