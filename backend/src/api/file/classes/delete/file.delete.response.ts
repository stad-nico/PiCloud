import { File } from 'src/db/entities/File';

export class FileDeleteResponse {
	readonly uuid: string;

	private constructor(uuid: string) {
		this.uuid = uuid;
	}

	public static from(file: File): FileDeleteResponse {
		return new FileDeleteResponse(file.uuid);
	}
}
