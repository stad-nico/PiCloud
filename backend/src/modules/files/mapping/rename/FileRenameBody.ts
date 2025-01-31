/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
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
export class FileRenameBody {
	/**
	 * The name to rename the file to.
	 * @type {string}
	 */
	@Matches(PathUtils.ValidFileNameRegExp)
	@ApiProperty({
		example: 'renamed.txt',
		description: 'The name to rename the file to',
		pattern: `${PathUtils.ValidFileNameRegExp}`,
	})
	readonly name: string;

	/**
	 * Creates a new FileRenameBody instance.
	 *
	 * @param   {string}         name the name to rename the file to
	 * @returns {FileRenameBody}      the FileRenameBody instance
	 */
	private constructor(name: string) {
		this.name = name;
	}
}
