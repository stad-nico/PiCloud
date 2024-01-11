import { FileRenameBody, FileRenameParams } from 'src/api/file/mapping/rename';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

/**
 * Used for mapping the http rename request parameters to a dto object for transferring to the `FileService`
 */
export class FileRenameDto {
	/**
	 * The current path of the file to rename.
	 * Includes the file `name` and extension (e.g. `home/bathroom/colors.txt`)
	 */
	readonly sourcePath: string;

	/**
	 * The destination path to rename the file to.
	 * Includes the file `name` and extension (e.g. `home/bathrooms/ugly-colors.txt`)
	 */
	readonly destinationPath: string;

	private constructor(sourcePath: string, destinationPath: string) {
		this.sourcePath = sourcePath;
		this.destinationPath = destinationPath;
	}

	/**
	 * Instantiates a new `FileRenameDto` from the http parameters
	 *
	 * @param {FileRenameParams} fileRenameParams - The rename request parameters
	 * @returns {FileRenameDto} A new `FileRenameDto` instance
	 */
	public static from(fileRenameParams: FileRenameParams, fileRenameBody: FileRenameBody): FileRenameDto {
		const normalizedSourcePath = PathUtils.normalize(fileRenameParams.path);

		if (!PathUtils.isValidFilePath(normalizedSourcePath)) {
			throw new ValidationError(`path ${fileRenameParams.path} is not a valid file path`);
		}

		const normalizedDestPath = PathUtils.normalize(fileRenameBody.newPath);

		if (!PathUtils.isValidFilePath(normalizedDestPath)) {
			throw new ValidationError(`path ${fileRenameBody.newPath} is not a valid file path`);
		}

		return new FileRenameDto(normalizedDestPath, normalizedSourcePath);
	}
}
