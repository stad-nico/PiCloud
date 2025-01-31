/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

/**
 * Class representing the json http response.
 * @class
 */
export class FileUploadResponse {
	/**
	 * The id of the uploaded file.
	 * @type {string}
	 */
	@ApiProperty({ example: '3c356389-dd1a-4c77-bc1b-7ac75f34d04d', description: 'The id of the uploaded file' })
	readonly id: string;

	/**
	 * Creates a new FileUploadResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                  id the id of the file
	 * @returns {FileUploadResponse}         the FileUploadResponse instance
	 */
	private constructor(id: string) {
		this.id = id;
	}

	/**
	 * Creates a new FileUploadResponse instance from the id.
	 * @public @static
	 *
	 * @param   {string}                  id the id of the uploaded file
	 * @returns {FileUploadResponse}         the FileUploadResponse instance
	 */
	public static from(id: string): FileUploadResponse {
		return new FileUploadResponse(id);
	}
}
