import { ApiProperty } from '@nestjs/swagger';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the json http response.
 * @class
 */
export class FileUploadResponse {
	/**
	 * The path of the uploaded file.
	 * @type {string}
	 */
	@ApiProperty({ example: '/path/to/file.txt', description: 'The path of the uploaded file' })
	readonly path: string;

	/**
	 * Creates a new FileUploadResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the file
	 * @returns {FileUploadResponse}           the FileUploadResponse instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new FileUploadResponse instance from the path.
	 * @public @static
	 *
	 * @param   {string}                  path the path of the uploaded file
	 * @returns {FileUploadResponse}           the FileUploadResponse instance
	 */
	public static from(path: string): FileUploadResponse {
		return new FileUploadResponse(PathUtils.normalizeFilePath(path));
	}
}
