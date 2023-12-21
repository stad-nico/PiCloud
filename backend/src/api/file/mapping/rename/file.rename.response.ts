import { File } from 'src/db/entities/File';

export class FileRenameResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(file: File): FileRenameResponse {
		return new FileRenameResponse(file.fullPath);
	}
}
