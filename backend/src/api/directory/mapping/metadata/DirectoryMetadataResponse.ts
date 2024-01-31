import { Directory } from 'src/db/entities/Directory';

export type DirectoryMetadataResponseType = Pick<Directory, 'id' | 'name' | 'createdAt' | 'updatedAt'> & {
	path: string;
	size: number;
	files: number;
	directories: number;
};

/**
 * Class representing the json http response.
 * @class
 */
export class DirectoryMetadataResponse {
	/**
	 * The id of the directory.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * The name of the directory.
	 * @type {string}
	 */
	readonly name: string;

	/**
	 * The relative path of the directory.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * The size of the directory.
	 * @type {number}
	 */
	readonly size: number;

	/**
	 * The amount of files this directory and each subdirectory contains in total.
	 * @type {number}
	 */
	readonly files: number;

	/**
	 * The amount of subdirectory this directory contains in total.
	 * @type {number}
	 */
	readonly directories: number;

	/**
	 * The creation date of the directory.
	 * @type {string}
	 */
	readonly createdAt: string;

	/**
	 * The last date at which a content of the directory was changed.
	 * @type {string}
	 */
	readonly updatedAt: string;

	/**
	 * Creates a new DirectoryMetadataResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                    id          the id
	 * @param   {string}                    name        the name
	 * @param   {string}                    path        the path
	 * @param   {number}                    size        the size
	 * @param   {number}                    files       the amount of files
	 * @param   {number}                    directories the amount of subdirectories
	 * @param   {string}                    createdAt   the creation date
	 * @param   {string}                    updatedAt   the last updated date
	 * @returns {DirectoryMetadataResponse}             the DirectoryMetadataResponse instance
	 */
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

	/**
	 * Creates a new DirectoryMetadataResponse instance from the metadata.
	 * @public @static
	 *
	 * @param   {DirectoryMetadataResponseType} obj the metadata of the directory
	 * @returns {DirectoryMetadataResponse}         the DirectoryMetadataResponse instance
	 */
	public static from(obj: DirectoryMetadataResponseType): DirectoryMetadataResponse {
		return new DirectoryMetadataResponse(
			obj.id,
			obj.name,
			obj.path,
			obj.size,
			obj.files,
			obj.directories,
			obj.createdAt.toISOString(),
			obj.updatedAt.toISOString()
		);
	}
}
