import { PathUtils } from 'src/util/PathUtils';

/**
import { PathUtils } from 'src/util/PathUtils';
 * Class representing the json http response.
 * @class
 */
export class DirectoryRestoreResponse {
	/**
	 * The path of the restored directory.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new DirectoryRestoreResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                   path the path of the restored directory
	 * @returns {DirectoryRestoreResponse}      the DirectoryRestoreResponse instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryRestoreResponse instance from the path.
	 * @public @static
	 *
	 * @param   {string}                   path the path of the restored directory
	 * @returns {DirectoryRestoreResponse}      the DirectoryRestoreResponse instance
	 */
	public static from(path: string) {
		return new DirectoryRestoreResponse(PathUtils.normalizeDirectoryPath(path));
	}
}
