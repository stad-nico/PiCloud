import { File } from 'src/api/files/entities/file.entity';

export class FileDeleteResponse {
	readonly uuid: string;

	constructor(uuid: string) {
		this.uuid = uuid;
	}

	public static from(file: File): FileDeleteResponse {
		return new FileDeleteResponse(file.uuid);
	}
}
