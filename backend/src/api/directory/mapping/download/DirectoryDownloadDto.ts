import { PathUtils } from 'src/util/PathUtils';
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
	 * @public @static
	 *
	 * @param   {DirectoryDownloadParams} directoryDownloadParams the http params
	 * @returns {DirectoryDownloadDto}                            the DirectoryDownloadDto instance
	 */
	public static from(directoryDownloadParams: DirectoryDownloadParams) {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryDownloadParams.path);

		return new DirectoryDownloadDto(normalizedPath);
	}
}
