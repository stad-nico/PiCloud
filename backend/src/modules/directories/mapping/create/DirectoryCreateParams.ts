/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

export class DirectoryCreateParams {
	@ApiProperty({
		example: '133a8736-111a-4cf7-ae84-dbe040ad4382',
		description: 'The id of the parent directory where the new directory will be created',
	})
	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}
}
