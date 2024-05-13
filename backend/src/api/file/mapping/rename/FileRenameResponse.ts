import { ApiProperty } from '@nestjs/swagger';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the json http response.
 * @class
 */
export class FileRenameResponse {
	/**
	 * The path of the file after renaming.
	 * @type {string}
	 */
	@ApiProperty({ description: 'The path of the file after renaming', example: '/new/path/to/file.txt' })
	readonly path: string;

	/**
	 * Creates a new FileRenameResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the file after renaming
	 * @returns {FileRenameResponse}           the FileRenameResponse instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new FileRenameResponse instance from the new path.
	 * @public @static
	 *
	 * @param   {string}                  destinationPath the new path
	 * @returns {FileRenameResponse}                      the FileRenameResponse instance
	 */
	public static from(destinationPath: string) {
		return new FileRenameResponse(PathUtils.normalizeFilePath(destinationPath));
	}
}
