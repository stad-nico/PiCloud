import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the http request url params.
 * @class
 */
export class DirectoryDownloadParams {
	/**
	 * The path of the directory to download.
	 * @type {string}
	 */
	@IsNotEmpty()
	@IsString()
	@Matches(PathUtils.ValidDirectoryPathRegExp, { message: 'path must be a valid directory path' })
	readonly path: string;

	/**
	 * Creates a new DirectoryDownloadParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the directory
	 * @returns {DirectoryDownloadParams}      the DirectoryDownloadParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
