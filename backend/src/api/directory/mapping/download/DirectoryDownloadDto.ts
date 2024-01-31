import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';
import { DirectoryDownloadParams } from './DirectoryDownloadParams';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryDownloadDto {
	/**
	 * The path of the directory to download.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new DirectoryDownloadDto instance.
	 * @private @constructor
	 *
	 * @param   {string}               path the path of the directory
	 * @returns {DirectoryDownloadDto}      the DirectoryDownloadDto instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryDownloadDto instance from the http params.
	 * Throws if the given params are not valid.
	 * @public @static
	 *
	 * @throws  {ValidationError} path must be a valid directory path
	 *
	 * @param   {DirectoryDownloadParams} directoryDownloadParams the http params
	 * @returns {DirectoryDownloadDto}                            the DirectoryDownloadDto instance
	 */
	public static from(directoryDownloadParams: DirectoryDownloadParams) {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryDownloadParams.path);

		if (!PathUtils.isValidDirectoryPath(normalizedPath)) {
			throw new ValidationError(`path ${directoryDownloadParams.path} is not a valid directory path`);
		}

		return new DirectoryDownloadDto(normalizedPath);
	}
}
