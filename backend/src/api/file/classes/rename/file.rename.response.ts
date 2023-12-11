import { File } from 'src/api/file/entities/file.entity';

export class FileRenameResponse {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(file: File): FileRenameResponse {
		return new FileRenameResponse(file.fullPath);
	}
}
