/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { FileDeleteParams } from 'src/api/file/mapping/delete/FileDeleteParams';
import { PathUtils } from 'src/util/PathUtils';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileDeleteDto {
	/**
	 * The path of the file to delete.
	 * @type {string}
	 */
	readonly path: string;

	/**
	 * Creates a new FileDeleteDto instance.
	 * @private @constructor
	 *
	 * @param   {string}             path the path of the file
	 * @returns {FileDeleteDto}           the FileDeleteDto instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new FileDeleteDto instance from the http params.
	 * @public @static
	 *
	 * @param   {FileDeleteParams} fileDeleteParams the http params
	 * @returns {FileDeleteDto}                     the FileDeleteDto instance
	 */
	public static from(fileDeleteParams: FileDeleteParams) {
		const normalizedPath = PathUtils.normalizeFilePath(fileDeleteParams.path);

		return new FileDeleteDto(normalizedPath);
	}
}
