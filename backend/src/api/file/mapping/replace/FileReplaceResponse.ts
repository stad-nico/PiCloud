/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the json http response.
 * @class
 */
export class FileReplaceResponse {
	/**
	 * The path of the replaced file.
	 * @type {string}
	 */
	@ApiProperty({ example: '/path/to/file.txt', description: 'The path of the replaced file' })
	readonly path: string;

	/**
	 * Creates a new FileReplaceResponse instance.
	 * @private @constructor
	 *
	 * @param   {string}                  path the path of the file
	 * @returns {FileReplaceResponse}         the FileReplaceResponse instance
	 */
	private constructor(path: string) {
		this.path = path;
	}

	/**
	 * Creates a new FileReplaceResponse instance from the path.
	 * @public @static
	 *
	 * @param   {string}                  path the path of the replaced file
	 * @returns {FileReplaceResponse}         the FileReplaceResponse instance
	 */
	public static from(path: string): FileReplaceResponse {
		return new FileReplaceResponse(PathUtils.normalizeFilePath(path));
	}
}
