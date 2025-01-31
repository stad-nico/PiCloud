/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

/**
 * Class representing the http request url params.
 * @class
 */
export class FileDeleteParams {
	/**
	 * The id of the file to delete.
	 * @type {string}
	 */
	@ApiProperty({ example: '853d4b18-8d1a-426c-b53e-74027ce1644b', description: 'The id of the file to delete' })
	readonly id: string;

	/**
	 * Creates a new FileDeleteParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                   id the id of the file
	 * @returns {FileDeleteParams}            the FileDeleteParams instance
	 */
	private constructor(id: string) {
		this.id = id;
	}
}
