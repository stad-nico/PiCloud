/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { FileDownloadParams } from 'src/api/file/mapping/download/FileDownloadParams';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileDownloadDto {
	/**
	 * The id of the file to download
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * Creates a new FileDownloadDto instance.
	 * @private @constructor
	 *
	 * @param   {string}               id the id of the file
	 * @returns {FileDownloadDto}         the FileDownloadDto instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new FileDownloadDto instance from the http params.
	 * @public @static
	 *
	 * @param   {FileDownloadParams} fileDownloadParams the http params
	 * @returns {FileDownloadDto}                       the FileDownloadDto instance
	 */
	public static from(fileDownloadParams: FileDownloadParams) {
		return new FileDownloadDto(fileDownloadParams.id);
	}
}
