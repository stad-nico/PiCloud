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
 * Class representing the http request body.
 * @class
 */
export class DirectoryCreateBody {
	/**
	 * The name of the new directory.
	 * @type {string}
	 */
	@Matches(PathUtils.ValidDirectoryNameRegExp)
	@ApiProperty({
		example: 'photos',
		description: 'The name of the new directory',
		pattern: `${PathUtils.ValidDirectoryNameRegExp}`,
	})
	readonly name: string;

	/**
	 * Creates a new DirectoryCreateBody instance.
	 *
	 * @param   {string}              name the name of the new directory
	 * @returns {DirectoryCreateBody}      the DirectoryCreateBody instance
	 */
	private constructor(name: string) {
		this.name = name;
	}
}
