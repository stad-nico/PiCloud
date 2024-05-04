/**
 * Class representing the http request url params.
 * @class
 */
export class DirectoryRenameBody {
	/**
	 * The path to rename the directory to.
	 * @type {string}
	 */
	readonly newPath: string;

	/**
	 * Creates a new DirectoryRenameBody instance.
	 *
	 * @param   {string}              newPath the path to rename the directory to
	 * @returns {DirectoryRenameBody}         the DirectoryRenameBody instance
	 */
	private constructor(newPath: string) {
		this.newPath = newPath;
	}
}
