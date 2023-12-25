import { FileRenameBody, FileRenameParams } from 'src/api/file/mapping/rename';

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
		return new FileRenameDto(fileRenameParams.path, fileRenameBody.newPath);
	}
}
