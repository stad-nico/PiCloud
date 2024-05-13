/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Readable } from 'stream';

/**
 * DTO for the readstream and additional infos.
 * @class
 */
export class FileDownloadResponse {
	/**
	 * The name of the file.
	 * @type {string}
	 */
	readonly name: string;

	/**
	 * The mime type of the file.
	 * @type {string}
	 */
	readonly mimeType: string;

	/**
	 * The readable stream of the file.
	 * @type {Readable}
	 */
	readonly readable: Readable;

	/**
	 * Creates a new FileDownloadResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                    name     the name of the file
	 * @param   {string}                    mimeType the mime type of the file
	 * @param   {Readable}                  readable the readable stream of the file
	 * @returns {FileDownloadResponse}               the FileDownloadResponse instance
	 */
	private constructor(name: string, mimeType: string, readable: Readable) {
		this.name = name;
		this.mimeType = mimeType;
		this.readable = readable;
	}

	/**
	 * Creates a new FileDownloadResponse instance from the name, mime type and stream.
	 * @public @static
	 *
	 * @param   {string}                    name     the name of the file
	 * @param   {string}                    mimeType the mime type of the file
	 * @param   {Readable}                  readable the readable stream of the file
	 * @returns {FileDownloadResponse}               the FileDownloadResponse instance
	 */
	public static from(name: string, mimeType: string, readable: Readable): FileDownloadResponse {
		return new FileDownloadResponse(name, mimeType, readable);
	}
}
