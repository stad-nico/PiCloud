/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

export class DirectoryCreateResponse {
	@ApiProperty({ example: '133a8736-111a-4cf7-ae84-dbe040ad4382', description: 'The id of the created directory' })
	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}

	public static from(id: string): DirectoryCreateResponse {
		return new DirectoryCreateResponse(id);
	}
}
