import { ApiProperty } from '@nestjs/swagger';

/**
 * Class representing the http request url params.
 * @class
 */
export class DirectoryMetadataParams {
	/**
	 * The path of the directory to get the metadata from.
	 * @type {string}
	 */
	@ApiProperty({ example: '/path/to/directory', description: 'The path of the directory to get the metadata from' })
	readonly path: string;

	/**
	 * Creates a new DirectoryMetadataParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the directory
	 * @returns {DirectoryMetadataParams}      the DirectoryMetadataParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
