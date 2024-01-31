import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the http request url params.
 * @class
 */
export class DirectoryCreateParams {
	/**
	 * The path of the directory to create.
	 * @type {string}
	 */
	@IsNotEmpty()
	@IsString()
	@Matches(PathUtils.ValidDirectoryPathRegExp, { message: 'path must be a valid directory path' })
	readonly path: string;

	/**
	 * Creates a new DirectoryCreateParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                 path the path of the directory
	 * @returns {DirectoryCreateParams}       the DirectoryCreateParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
