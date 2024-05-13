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
export class FileRenameBody {
	/**
	 * The path to rename the file to.
	 * @type {string}
	 */
	@Matches(PathUtils.ValidFilePathRegExp)
	@ApiProperty({
		example: '/new/path/to/file.txt',
		description: 'The path to rename the file to',
		pattern: `${PathUtils.ValidFilePathRegExp}`,
	})
	readonly newPath: string;

	/**
	 * Creates a new FileRenameBody instance.
	 *
	 * @param   {string}              newPath the path to rename the file to
	 * @returns {FileRenameBody}              the FileRenameBody instance
	 */
	private constructor(newPath: string) {
		this.newPath = newPath;
	}
}
