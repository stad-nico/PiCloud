import { ApiProperty } from '@nestjs/swagger';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the json http response.
 * @class
 */
export class DirectoryCreateResponse {
	/**
	 * The path of the created directory.
	 * @type {string}
	 */
	@ApiProperty({ example: '/path/to/directory', description: 'The path of the created directory' })
	readonly path: string;

	/**
	 * Creates a new DirectoryCreateResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the directory
	 * @returns {DirectoryCreateResponse}      the DirectoryCreateResponse instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryCreateResponse instance from the path.
	 * @public @static
	 *
	 * @param   {string}                  path the path of the created directory
	 * @returns {DirectoryCreateResponse}      the DirectoryCreateResponse instance
	 */
	public static from(path: string): DirectoryCreateResponse {
		return new DirectoryCreateResponse(PathUtils.normalizeDirectoryPath(path));
	}
}
