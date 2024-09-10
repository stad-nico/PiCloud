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
export class DirectoryRenameBody {
	/**
	 * The new name of the directory.
	 * @type {string}
	 */
	@Matches(PathUtils.ValidDirectoryNameRegExp)
	@ApiProperty({
		example: 'renamed',
		description: 'The new name of the directory',
		pattern: `${PathUtils.ValidDirectoryNameRegExp}`,
	})
	readonly name: string;

	/**
	 * Creates a new DirectoryRenameBody instance.
	 *
	 * @param   {string}              name the new name of the directory
	 * @returns {DirectoryRenameBody}      the DirectoryRenameBody instance
	 */
	private constructor(name: string) {
		this.name = name;
	}
}
