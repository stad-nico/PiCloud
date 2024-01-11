import { FileDeleteParams } from 'src/api/file/mapping/delete/FileDeleteParams';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

/**
 * Used for mapping the http delete request parameters to a dto object for transferring to the `FileService`
 */
export class FileDeleteDto {
	/**
	 * The path of the file to delete.
	 * Includes the file `name` and extension (e.g. `pictures/not-good.png`)
	 */
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Instantiates a new `FileDeleteDto` from the http parameters
	 *
	 * @param {FileDeleteParams} fileDeleteParams - The delete request parameters
	 * @returns {FileDeleteDto} A new `FileDeleteDto` instance
	 */
	public static from(fileDeleteParams: FileDeleteParams): FileDeleteDto {
		const normalizedPath = PathUtils.normalize(fileDeleteParams.path);

		if (!PathUtils.isValidFilePath(normalizedPath)) {
			throw new ValidationError(`path ${fileDeleteParams.path} is not a valid file path`);
		}

		return new FileDeleteDto(normalizedPath);
	}
}
