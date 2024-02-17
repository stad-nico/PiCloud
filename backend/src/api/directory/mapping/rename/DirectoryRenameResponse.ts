import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the json http response.
 * @class
 */
export class DirectoryRenameResponse {
	/**
	 * The path of the directory after renaming.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new DirectoryRenameResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the directory after renaming
	 * @returns {DirectoryRenameResponse}      the DirectoryRenameResponse instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryRenameResponse instance from the new path.
	 * @public @static
	 *
	 * @param   {string}                  destinationPath the new path
	 * @returns {DirectoryRenameResponse}                 the DirectoryRenameResponse instance
	 */
	public static from(destinationPath: string) {
		return new DirectoryRenameResponse(PathUtils.normalizeDirectoryPath(destinationPath));
	}
}
