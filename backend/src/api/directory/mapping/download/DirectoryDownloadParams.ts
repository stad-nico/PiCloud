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
export class DirectoryDownloadParams {
	/**
	 * The path of the directory to download.
	 * @type {string}
	 */
	@ApiProperty({ example: '/path/to/directory', description: 'The path of the directory to download' })
	readonly path: string;

	/**
	 * Creates a new DirectoryDownloadParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the directory
	 * @returns {DirectoryDownloadParams}      the DirectoryDownloadParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
