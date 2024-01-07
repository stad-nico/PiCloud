import { Directory } from 'src/db/entities/Directory';
import { File } from 'src/db/entities/File';

export type DirectoryContentDirectoryType = Pick<Directory, 'name' | 'created' | 'updated'> & { size: number };
export type DirectoryContentFileType = Pick<File, 'name' | 'mimeType' | 'size' | 'created' | 'updated'>;

export type DirectoryContentResponseType = {
	files: DirectoryContentFileType[];
	directories: DirectoryContentDirectoryType[];
};

export class DirectoryContentResponse {
	readonly files: DirectoryContentFileType[];

	readonly directories: DirectoryContentDirectoryType[];

	private constructor(files: DirectoryContentFileType[], directories: DirectoryContentDirectoryType[]) {
		this.files = files;
		this.directories = directories;
	}

	public static from(content: { files: DirectoryContentFileType[]; directories: DirectoryContentDirectoryType[] }) {
		return new DirectoryContentResponse(content.files, content.directories);
	}
}
