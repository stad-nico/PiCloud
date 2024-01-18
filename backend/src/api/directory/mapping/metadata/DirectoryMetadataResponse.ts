import { Directory } from 'src/db/entities/Directory';

export type DirectoryMetadataResponseType = Pick<Directory, 'id' | 'name' | 'createdAt' | 'updatedAt'> & {
	path: string;
	size: number;
	files: number;
	directories: number;
};

export class DirectoryMetadataResponse {
	readonly id: string;

	readonly name: string;

	readonly path: string;

	readonly size: number;

	readonly files: number;

	readonly directories: number;

	readonly createdAt: string;

	readonly updatedAt: string;

	private constructor(
		id: string,
		name: string,
		path: string,
		size: number,
		files: number,
		directories: number,
		createdAt: string,
		updatedAt: string
	) {
		this.id = id;
		this.name = name;
		this.path = path;
		this.size = size;
		this.files = files;
		this.directories = directories;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public static from(obj: DirectoryMetadataResponseType): DirectoryMetadataResponse {
		return new DirectoryMetadataResponse(
			obj.id,
			obj.name,
			obj.path,
			obj.size,
			obj.files,
			obj.directories,
			obj.createdAt + '',
			obj.updatedAt + ''
		);
	}
}
