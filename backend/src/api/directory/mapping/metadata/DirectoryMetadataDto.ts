import { PathUtils } from 'src/util/PathUtils';
import { DirectoryMetadataParams } from './DirectoryMetadataParams';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryMetadataDto {
	/**
	 * The path of the directory to get the metadata from.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new DirectoryMetadataDto instance.
	 * @private @constructor
	 *
	 * @param   {string}               path the path of the directory
	 * @returns {DirectoryMetadataDto}      the DirectoryMetadataDto instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new DirectoryMetadataDto instance from the http params.
	 * @public @static
	 *
	 * @param   {DirectoryMetadataParams} directoryMetadataParams the http params
	 * @returns {DirectoryMetadataDto}                            the DirectoryMetadataDto instance
	 */
	public static from(directoryMetadataParams: DirectoryMetadataParams): DirectoryMetadataDto {
		const normalizedPath = PathUtils.normalizeDirectoryPath(directoryMetadataParams.path);

		return new DirectoryMetadataDto(normalizedPath);
	}
}
