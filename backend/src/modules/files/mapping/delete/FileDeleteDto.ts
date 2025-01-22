/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { FileDeleteParams } from 'src/modules/files//mapping/delete/FileDeleteParams';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class FileDeleteDto {
	/**
	 * The id of the file to delete.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * Creates a new FileDeleteDto instance.
	 * @private @constructor
	 *
	 * @param   {string}             id the id of the file
	 * @returns {FileDeleteDto}         the FileDeleteDto instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new FileDeleteDto instance from the http params.
	 * @public @static
	 *
	 * @param   {FileDeleteParams} fileDeleteParams the http params
	 * @returns {FileDeleteDto}                     the FileDeleteDto instance
	 */
	public static from(fileDeleteParams: FileDeleteParams) {
		return new FileDeleteDto(fileDeleteParams.id);
	}
}
