import { DirectoryDeleteParams } from 'src/api/directory/mapping/delete/DirectoryDeleteParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

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
	 * Throws if the given params are not valid.
	 * @public @static
	 *
	 * @throws  {ValidationError} path must be a valid directory path
	 *
	 * @param   {DirectoryDeleteParams} directoryDeleteParams the http params
	 * @returns {DirectoryDeleteDto}                          the DirectoryDeleteDto instance
	 */
	public static from(directoryDeleteParams: DirectoryDeleteParams) {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryDeleteParams.path);

		if (!PathUtils.isDirectoryPathValid(normalizedPath)) {
			throw new ValidationError(`path ${directoryDeleteParams.path} is not a valid directory path`);
		}

		return new DirectoryDeleteDto(normalizedPath);
	}
}
