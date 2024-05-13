/**-------------------------------------------------------------------------
 * Copyright (c) 2024 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Matches } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { PathUtils } from 'src/util/PathUtils';

/**
 * Class representing the http request url params.
 * @class
 */
export class DirectoryCreateParams {
	/**
	 * The path of the directory to create.
	 * @type {string}
	 */
	@Matches(PathUtils.ValidDirectoryPathRegExp)
	@ApiProperty({
		example: '/path/to/directory',
		description: 'The path of the directory to create',
		pattern: `${PathUtils.ValidDirectoryPathRegExp}`,
	})
	readonly path: string;

	/**
	 * Creates a new DirectoryCreateParams instance.
	 * @private @constructor
	 *
	 * @param   {string}                 path the path of the directory
	 * @returns {DirectoryCreateParams}       the DirectoryCreateParams instance
	 */
	private constructor(path: string) {
		this.path = path;
	}
}
