/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { DirectoryDeleteParams } from 'src/api/directory/mapping/delete/DirectoryDeleteParams';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryDeleteDto {
	/**
	 * The id of the directory to delete.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * Creates a new DirectoryDeleteDto instance.
	 * @private @constructor
	 *
	 * @param   {string}             id the id of the directory
	 * @returns {DirectoryDeleteDto}    the DirectoryDeleteDto instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new DirectoryDeleteDto instance from the http params.
	 * @public @static
	 *
	 * @param   {DirectoryDeleteParams} directoryDeleteParams the http params
	 * @returns {DirectoryDeleteDto}                          the DirectoryDeleteDto instance
	 */
	public static from(directoryDeleteParams: DirectoryDeleteParams) {
		return new DirectoryDeleteDto(directoryDeleteParams.id);
	}
}
