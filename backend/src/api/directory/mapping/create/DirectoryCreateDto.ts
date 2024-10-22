import path from 'path';
import { DirectoryCreateParams } from 'src/api/directory/mapping/create/DirectoryCreateParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryCreateDto {
	/**
	 * The path of the directory to create.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new DirectoryCreateDto instance.
	 * @private @constructor
	 *
	 * @param   {string}              path the path of the directory to create
	 * @returns {DirectoryCreateDto}       the DirectoryCreateDto instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryCreateDto instance from the http params.
	 * Throws if the given params are not valid.
	 * @public @static
	 *
	 * @throws  {ValidationError} path must be a valid directory path
	 *
	 * @param   {DirectoryCreateParams} directoryCreateParams the http params
	 * @returns {DirectoryCreateDto}                          the DirectoryCreateDto instance
	 */
	public static from(directoryCreateParams: DirectoryCreateParams): DirectoryCreateDto {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryCreateParams.path);

		if (!PathUtils.isDirectoryPathValid(normalizedPath)) {
			throw new ValidationError(`path ${directoryCreateParams.path} is not a valid directory path`);
		}

		if (path.basename(normalizedPath).length > PathUtils.MaxDirectoryNameLength) {
			throw new ValidationError(
				`directory name ${path.basename(directoryCreateParams.path)} exceeds the directory name limit of ${PathUtils.MaxDirectoryNameLength} chars`
			);
		}

		return new DirectoryCreateDto(normalizedPath);
	}
}
