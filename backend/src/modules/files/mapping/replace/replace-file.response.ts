/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

export class ReplaceFileResponse {
	@ApiProperty({ example: '3c356389-dd1a-4c77-bc1b-7ac75f34d04d', description: 'The id of the replaced file' })
	readonly id: string;

	private constructor(id: string) {
		this.id = id;
	}

	public static from(id: string): ReplaceFileResponse {
		return new ReplaceFileResponse(id);
	}
}
