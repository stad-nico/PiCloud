import { FileRestoreParams } from 'src/api/file/mapping/restore';

/**
 * Used for mapping the http restore request parameters to a dto object for transferring to the `FileService`
 */
export class FileRestoreDto {
	/**
	 * The `uuid` of the file to restore
	 */
	readonly uuid: string;

	private constructor(uuid: string) {
		this.uuid = uuid;
	}

	/**
	 * Instantiates a new `FileRestoreDto` from the http parameters
	 *
	 * @param {FileRestoreParams} fileRestoreParams - The restore request parameters
	 * @returns {FileRestoreDto} A new `FileRestoreDto` instance
	 */
	public static from(fileRestoreParams: FileRestoreParams): FileRestoreDto {
		return new FileRestoreDto(fileRestoreParams.id);
	}
}
