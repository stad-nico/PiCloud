/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { DirectoryContentParams } from 'src/api/directory/mapping/content/DirectoryContentParams';

/**
 * DTO for bundling the http request data.
 * @class
 */
export class DirectoryContentDto {
	/**
	 * The id of the directory to get the contents from.
	 * @type {string}
	 */
	readonly id: string;

	/**
	 * Creates a new DirectoryContentDto instance.
	 * @private @constructor
	 *
	 * @param   {string}              id the id of the directory
	 * @returns {DirectoryContentDto}    the DirectoryContentDto instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new DirectoryContentDto instance from the http params.
	 * @public @static
	 *
	 * @param   {DirectoryContentParams} directoryContentParams the http params
	 * @returns {DirectoryContentDto}                           the DirectoryContentDto instance
	 */
	public static from(directoryContentParams: DirectoryContentParams) {
		return new DirectoryContentDto(directoryContentParams.id);
	}
}
