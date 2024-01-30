import { File } from 'src/db/entities/File';

type FileMetadataResponseType = Pick<File, 'id' | 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'> & { path: string };

export class FileMetadataResponse {
	readonly uuid: string;

	readonly name: string;

	readonly path: string;

	readonly mimeType: string;

	readonly size: number;

	readonly created: Date;

	readonly updated: Date;

	private constructor(uuid: string, name: string, path: string, mimeType: string, size: number, created: Date, updated: Date) {
		this.uuid = uuid;
		this.name = name;
		this.path = path;
		this.mimeType = mimeType;
		this.size = size;
		this.created = created;
		this.updated = updated;
	}

	public static from(obj: FileMetadataResponseType): FileMetadataResponse {
		return new FileMetadataResponse(obj.id, obj.name, obj.path, obj.mimeType, obj.size, obj.createdAt, obj.updatedAt);
	}
}
