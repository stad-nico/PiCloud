/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

/**
 * Class representing the http request url params.
 * @class
 */
export class DirectoryRenameParams {
	/**
	 * The path of the directory to rename.
	 * @type {string}
	 */
	@ApiProperty({ example: '/path/to/directory', description: 'The path of the directory to rename' })
	readonly path: string;

	/**
	 * Creates a new DirectoryRenameParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                path the path of the directory
	 * @returns {DirectoryRenameParams}      the DirectoryRenameParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
