/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { PathUtils } from 'src/util/PathUtils';

export class CreateDirectoryBody {
	@Matches(PathUtils.ValidDirectoryNameRegExp)
	@ApiProperty({
		example: 'photos',
		description: 'The name of the new directory',
		pattern: `${PathUtils.ValidDirectoryNameRegExp}`,
	})
	readonly name: string;

	private constructor(name: string) {
		this.name = name;
	}
}
