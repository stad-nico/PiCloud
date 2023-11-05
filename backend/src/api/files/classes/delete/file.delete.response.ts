import { RecycledFile } from 'src/api/files/entities/recycledFile.entity';

export class FileDeleteResponse {
	readonly uuid: string;

	constructor(uuid: string) {
		this.uuid = uuid;
	}

	public static fromRecycledFile(recycledFile: RecycledFile): FileDeleteResponse {
		return new FileDeleteResponse(recycledFile.uuid);
	}
}
