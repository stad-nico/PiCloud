/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserBody {
	@ApiProperty({ description: 'The username', type: 'string', example: 'exampleUser123' })
	readonly username!: string;

	@ApiProperty({ description: 'The password', type: 'string' })
	readonly password!: string;
}
