import { ApiProperty } from '@nestjs/swagger';

/**
 * Class representing the http request url params.
 * @class
 */
export class FileRenameParams {
	/**
	 * The path of the file to rename.
	 * @type {string}
	 */
	@ApiProperty({ example: '/path/to/file.txt', description: 'The path of the file to rename' })
	readonly path: string;

	/**
	 * Creates a new FileRenameParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                path the path of the file
	 * @returns {FileRenameParams}           the FileRenameParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
