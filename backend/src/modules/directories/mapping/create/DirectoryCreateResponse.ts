/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

/**
 * Class representing the json http response.
 * @class
 */
export class DirectoryCreateResponse {
	/**
	 * The id of the created directory.
	 * @type {string}
	 */
	@ApiProperty({ example: '/path/to/directory', description: 'The path of the created directory' })
	readonly id: string;

	/**
	 * Creates a new DirectoryCreateResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                  id the id of the directory
	 * @returns {DirectoryCreateResponse}    the DirectoryCreateResponse instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new DirectoryCreateResponse instance from the id.
	 * @public @static
	 *
	 * @param   {string}                  id the id of the created directory
	 * @returns {DirectoryCreateResponse}    the DirectoryCreateResponse instance
	 */
	public static from(id: string): DirectoryCreateResponse {
		return new DirectoryCreateResponse(id);
	}
}
