import { DirectoryDeleteParams } from 'src/api/directory/mapping/delete/DirectoryDeleteParams';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryDeleteDto {
	/**
	 * The path of the directory to delete.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new DirectoryDeleteDto instance.
	 * @private @constructor
	 *
	 * @param   {string}             path the path of the directory
	 * @returns {DirectoryDeleteDto}      the DirectoryDeleteDto instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryDeleteDto instance from the http params.
	 * @public @static
	 *
	 * @param   {DirectoryDeleteParams} directoryDeleteParams the http params
	 * @returns {DirectoryDeleteDto}                          the DirectoryDeleteDto instance
	 */
	public static from(directoryDeleteParams: DirectoryDeleteParams) {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryDeleteParams.path);

		return new DirectoryDeleteDto(normalizedPath);
	}
}
