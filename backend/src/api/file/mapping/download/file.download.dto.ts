import * as path from 'path';
import { FileDownloadParams } from 'src/api/file/mapping/download/file.download.params';

/**
 * Used for mapping the http download request parameters to a dto object for transferring to the `FileService`
 */
export class FileDownloadDto {
	/**
	 * The path of the file to download.
	 * Includes the file `name` and extension (e.g. `work/excel/sheet.xls`)
	 */
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Instantiates a new `FileDownloadDto` from the http parameters
	 *
	 * @param {FileDownloadParams} fileDownloadParams - The download request parameters
	 * @returns {FileDownloadDto} A new `FileDownloadDto` instance
	 */
	public static from(fileDownloadParams: FileDownloadParams): FileDownloadDto {
		return new FileDownloadDto(path.normalize(fileDownloadParams.path));
	}
}
