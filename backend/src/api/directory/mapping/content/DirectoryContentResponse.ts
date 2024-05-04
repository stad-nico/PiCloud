import { Directory } from 'src/db/entities/Directory';
import { File } from 'src/db/entities/File';

export type DirectoryContentDirectoryType = Pick<Directory, 'name' | 'createdAt' | 'updatedAt'> & { size: number };
export type DirectoryContentFileType = Pick<File, 'name' | 'mimeType' | 'size' | 'createdAt' | 'updatedAt'>;

export type DirectoryContentResponseType = {
	files: DirectoryContentFileType[];
	directories: DirectoryContentDirectoryType[];
};

/**
 * Class representing the json http response.
 * @class
 */
export class DirectoryContentResponse {
	/**
	 * The files the directory contains.
	 * @type {DirectoryContentFileType[]}
	 */
	readonly files: DirectoryContentFileType[];

	/**
	 * The subdirectories the directory contains.
	 * @type {DirectoryContentDirectoryType[]}
	 */
	readonly directories: DirectoryContentDirectoryType[];

	/**
	 * Creates a new DirectoryContentResponse instance.
	 * @private @constructor
	 *
	 * @param   {DirectoryContentFileType[]}      files       the files
	 * @param   {DirectoryContentDirectoryType[]} directories the directories
	 * @returns {DirectoryContentResponse}                    the DirectoryContentResponse instance
	 */
	private constructor(files: DirectoryContentFileType[], directories: DirectoryContentDirectoryType[]) {
		this.files = files;
		this.directories = directories;
	}

	/**
	 * Creates a new DirectoryContentResponse instance from the content.
	 * @public @static
	 *
	 * @param   {DirectoryContentResponseType} content the files and subdirectories
	 * @returns {DirectoryContentResponse}             the DirectoryContentResponse instance
	 */
	public static from(content: DirectoryContentResponseType) {
		return new DirectoryContentResponse(content.files, content.directories);
	}
}
