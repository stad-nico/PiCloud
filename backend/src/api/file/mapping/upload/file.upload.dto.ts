import { lookup } from 'mime-types';
import * as path_ from 'path';
import { FileUploadParams } from 'src/api/file/mapping/upload/file.upload.params';

/**
 * Used for mapping the http upload request parameters to a dto object for transferring to the `FileService`
 */
export class FileUploadDto {
	/**
	 * The path of the file to upload to.
	 * Includes the file `name` and extension (e.g `secret/things/password.md`)
	 */
	readonly path: string;

	/**
	 * The `mimeType` of the file
	 */
	readonly mimeType: string;

	/**
	 * The binary contents of the file
	 */
	readonly buffer: Buffer;

	private constructor(path: string, mimeType: string, buffer: Buffer) {
		this.path = path;
		this.mimeType = mimeType;
		this.buffer = buffer;
	}

	/**
	 * Instantiates a new `FileUploadDto` from the http parameters
	 *
	 * @param {FileUploadParams} fileUploadParams - The metadata request parameters
	 * @returns {FileUploadDto} A new `FileUploadDto` instance
	 */
	public static from(path: string, file: Pick<Express.Multer.File, 'mimetype' | 'size' | 'buffer'>): FileUploadDto {
		return new FileUploadDto(path_.normalize(path), lookup(path) || 'octet-stream', file.buffer);
	}

	/**
	 * Creates a `File` object with the following necessary keys for a db insert:
	 * - `name`
	 * - `parent`
	 * - `size`
	 * - `mimeType`
	 *
	 * @param {string} parent - The uuid of the parent directory
	 * @returns {Pick<File, 'name' | 'parent' | 'size' | 'mimeType'>} A new `File` object
	 */
	// public toFile(parent: string): Pick<File, 'name' | 'parent' | 'size' | 'mimeType'> {
	// 	return {
	// 		name: path_.basename(this.path),
	// 		size: Buffer.byteLength(this.buffer),
	// 		mimeType: this.mimeType,
	// 		parent: parent,
	// 	};
	// }
}
