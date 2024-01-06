import { Directory } from 'src/db/entities/Directory';
import { PathUtils } from 'src/util/PathUtils';

export type DirectoryMetadataResponseType = Pick<Directory, 'uuid' | 'name' | 'created' | 'updated'> & {
	path: string;
	size: number;
	files: number;
	directories: number;
};

export class DirectoryMetadataResponse {
	readonly uuid: string;

	readonly name: string;

	readonly path: string;

	readonly size: number;

	readonly files: number;

	readonly directories: number;

	readonly created: string;

	readonly updated: string;

	private constructor(
		uuid: string,
		name: string,
		path: string,
		size: number,
		files: number,
		directories: number,
		created: string,
		updated: string
	) {
		this.uuid = uuid;
		this.name = name;
		this.path = path;
		this.size = size;
		this.files = files;
		this.directories = directories;
		this.created = created;
		this.updated = updated;
	}

	public static from(obj: DirectoryMetadataResponseType): DirectoryMetadataResponse {
		return new DirectoryMetadataResponse(
			obj.uuid,
			obj.name,
			PathUtils.normalize(obj.path),
			obj.size,
			obj.files,
			obj.directories,
			obj.created + '',
			obj.updated + ''
		);
	}
}
