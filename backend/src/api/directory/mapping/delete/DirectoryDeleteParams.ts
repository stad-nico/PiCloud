import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the http request url params.
 * @class
 */
export class DirectoryDeleteParams {
	/**
	 * The path of the directory to delete.
	 * @type {string}
	 */
	@IsNotEmpty()
	@IsString()
	@Matches(PathUtils.ValidDirectoryPathRegExp, { message: 'path must be a valid directory path' })
	readonly path: string;

	/**
	 * Creates a new DirectoryDeleteParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                path the path of the directory
	 * @returns {DirectoryDeleteParams}      the DirectoryDeleteParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
