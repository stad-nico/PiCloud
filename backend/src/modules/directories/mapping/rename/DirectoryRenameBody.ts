/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { PathUtils } from 'src/util/PathUtils';

export class DirectoryRenameBody {
	@Matches(PathUtils.ValidDirectoryNameRegExp)
	@ApiProperty({
		example: 'renamed',
		description: 'The new name of the directory',
		pattern: `${PathUtils.ValidDirectoryNameRegExp}`,
	})
	readonly name: string;

	private constructor(name: string) {
		this.name = name;
	}
}
