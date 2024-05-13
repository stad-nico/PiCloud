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
export class FileDownloadParams {
	/**
	 * The path of the file to download.
	 * @type {string}
	 */
	@ApiProperty({ example: '/path/to/file.txt', description: 'The path of the file to download' })
	readonly path: string;

	/**
	 * Creates a new FileDownloadParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the file
	 * @returns {FileDownloadParams}           the FileDownloadParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
