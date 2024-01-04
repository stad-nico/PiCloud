import { Directory } from 'src/db/entities/Directory';

export type DirectoryContentDirectoryType = Pick<Directory, 'name' | 'created' | 'updated'> & { size: number };
export type DirectoryContentFileType = any; // Pick<File, 'name' | 'mimeType' | 'size' | 'created' | 'updated'>;

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

	public static from(files: DirectoryContentFileType[], directories: DirectoryContentDirectoryType[]) {
		return new DirectoryContentResponse(files, directories);
	}
}
