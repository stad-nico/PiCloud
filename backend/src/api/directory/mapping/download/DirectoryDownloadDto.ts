/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { DirectoryDownloadParams } from 'src/api/directory/mapping/download/DirectoryDownloadParams';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryDownloadDto {
	/**
	 * The id of the directory to download.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * Creates a new DirectoryDownloadDto instance.
	 * @private @constructor
	 *
	 * @param   {string}               id the id of the directory
	 * @returns {DirectoryDownloadDto}    the DirectoryDownloadDto instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new DirectoryDownloadDto instance from the http params.
	 * @public @static
	 *
	 * @param   {DirectoryDownloadParams} directoryDownloadParams the http params
	 * @returns {DirectoryDownloadDto}                            the DirectoryDownloadDto instance
	 */
	public static from(directoryDownloadParams: DirectoryDownloadParams) {
		return new DirectoryDownloadDto(directoryDownloadParams.id);
	}
}
