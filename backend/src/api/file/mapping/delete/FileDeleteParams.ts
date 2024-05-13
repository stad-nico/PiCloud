import { ApiProperty } from '@nestjs/swagger';

/**
 * Class representing the http request url params.
 * @class
 */
export class FileDeleteParams {
	/**
	 * The path of the file to delete.
	 * @type {string}
	 */
	@ApiProperty({ example: '/path/to/file.txt', description: 'The path of the file to delete' })
	readonly path: string;

	/**
	 * Creates a new FileDeleteParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                path the path of the file
	 * @returns {FileDeleteParams}           the FileDeleteParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
