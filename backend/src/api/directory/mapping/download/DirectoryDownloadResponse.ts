import { Readable } from 'stream';

/**
 * DTO for the archive stream and additional infos.
 * @class
 */
export class DirectoryDownloadResponse {
	/**
	 * The name of the archive.
	 * @type {string}
	 */
	readonly name: string;

	/**
	 * The mime type of the archive.
	 * @type {string}
	 */
	readonly mimeType: string;

	/**
	 * The readable stream of the archive.
	 * @type {Readable}
	 */
	readonly readable: Readable;

	/**
	 * Creates a new DirectoryDownloadResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                    name     the name of the archive
	 * @param   {string}                    mimeType the mime type of the archive
	 * @param   {Readable}                  readable the readable stream of the archive
	 * @returns {DirectoryDownloadResponse}          the DirectoryDownloadResponse instance
	 */
	private constructor(name: string, mimeType: string, readable: Readable) {
		this.name = name;
		this.mimeType = mimeType;
		this.readable = readable;
	}

	/**
	 * Creates a new DirectoryDeleteResponse instance from the name, mime type and stream.
	 * @public @static
	 *
	 * @param   {string}                    name     the name of the archive
	 * @param   {string}                    mimeType the mime type of the archive
	 * @param   {Readable}                  readable the readable stream of the archive
	 * @returns {DirectoryDownloadResponse}          the DirectoryDownloadResponse instance
	 */
	public static from(name: string, mimeType: string, readable: Readable): DirectoryDownloadResponse {
		return new DirectoryDownloadResponse(name, mimeType, readable);
	}
}
