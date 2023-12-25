import * as path from 'path';
import { FileMetadataParams } from 'src/api/file/mapping/metadata/file.metadata.params';

/**
 * Used for mapping the http metadata request parameters to a dto object for transferring to the `FileService`
 */
export class FileMetadataDto {
	/**
	 * The path of the file to get the metadata from.
	 * Includes the file `name` and extension (e.g. `vacation/europe/countries.txt`)
	 */
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Instantiates a new `FileMetadataDto` from the http parameters
	 *
	 * @param {FileMetadataParams} fileMetadataParams - The metadata request parameters
	 * @returns {FileMetadataDto} A new `FileMetadataDto` instance
	 */
	public static from(fileMetadataParams: FileMetadataParams): FileMetadataDto {
		return new FileMetadataDto(path.normalize(fileMetadataParams.path));
	}
}
