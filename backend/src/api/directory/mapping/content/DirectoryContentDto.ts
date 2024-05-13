import { DirectoryContentParams } from 'src/api/directory/mapping/content/DirectoryContentParams';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryContentDto {
	/**
	 * The path of the directory to get the contents from.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new DirectoryContentDto instance.
	 * @private @constructor
	 *
	 * @param   {string}              path the path of the directory
	 * @returns {DirectoryContentDto}      the DirectoryContentDto instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryContentDto instance from the http params.
	 * @public @static
	 *
	 * @param   {DirectoryContentParams} directoryContentParams the http params
	 * @returns {DirectoryContentDto}                           the DirectoryContentDto instance
	 */
	public static from(directoryContentParams: DirectoryContentParams) {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryContentParams.path);

		return new DirectoryContentDto(normalizedPath);
	}
}
