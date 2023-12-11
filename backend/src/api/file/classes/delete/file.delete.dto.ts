import { FileDeleteParams } from 'src/api/file/classes/delete/file.delete.params';

export class FileDeleteDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(fileDeleteParams: FileDeleteParams): FileDeleteDto {
		return new FileDeleteDto(fileDeleteParams.path);
	}
}
