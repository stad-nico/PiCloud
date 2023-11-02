import { File } from 'src/api/files/entities/file.entity';

export class FileMetadataResponse {
	readonly fullPath: string;

	readonly name: string;

	readonly path: string;

	readonly mimeType: string;

	readonly size: number;

	readonly created: Date;

	readonly updated: Date;

	constructor(fullPath: string, name: string, path: string, mimeType: string, size: number, created: Date, updated: Date) {
		this.fullPath = fullPath;
		this.name = name;
		this.path = path;
		this.mimeType = mimeType;
		this.size = size;
		this.created = created;
		this.updated = updated;
	}

	public static from(file: File): FileMetadataResponse {
		return new FileMetadataResponse(file.fullPath, file.name, file.path, file.mimeType, file.size, file.created, file.updated);
	}
}
