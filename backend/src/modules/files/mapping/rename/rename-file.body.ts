/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { PathUtils } from 'src/util/PathUtils';

export class RenameFileBody {
	@Matches(PathUtils.ValidFileNameRegExp)
	@ApiProperty({
		example: 'renamed.txt',
		description: 'The name to rename the file to',
		pattern: `${PathUtils.ValidFileNameRegExp}`,
	})
	readonly name!: string;
}
