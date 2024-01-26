import { DirectoryContentParams } from 'src/api/directory/mapping/content/DirectoryContentParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

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
	 * Creates a new DirectoryContentDto instance from http params.
	 * Throws if the given params are not valid.
	 * @public @static
	 *
	 * @throws  {ValidationError} path must be a valid directory path
	 *
	 * @param   {DirectoryContentParams} directoryContentParams the http params
	 * @returns {DirectoryContentDto}                           the DirectoryContentDto instance
	 */
	public static from(directoryContentParams: DirectoryContentParams) {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryContentParams.path);

		if (!PathUtils.isValidDirectoryPath(normalizedPath)) {
			throw new ValidationError(`path ${directoryContentParams.path} is not a valid directory path`);
		}

		return new DirectoryContentDto(directoryContentParams.path);
	}
}
