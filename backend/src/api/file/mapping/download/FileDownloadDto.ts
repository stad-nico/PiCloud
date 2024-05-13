/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { FileDownloadParams } from 'src/api/file/mapping/download/FileDownloadParams';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileDownloadDto {
	/**
	 * The path of the file to download.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new FileDownloadDto instance.
	 * @private @constructor
	 *
	 * @param   {string}               path the path of the file
	 * @returns {FileDownloadDto}           the FileDownloadDto instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new FileDownloadDto instance from the http params.
	 * @public @static
	 *
	 * @param   {FileDownloadParams} fileDownloadParams the http params
	 * @returns {FileDownloadDto}                       the FileDownloadDto instance
	 */
	public static from(fileDownloadParams: FileDownloadParams) {
		const normalizedPath = PathUtils.normalizeFilePath(fileDownloadParams.path);

		return new FileDownloadDto(normalizedPath);
	}
}
