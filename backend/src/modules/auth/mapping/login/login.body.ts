/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

export class LoginBody {
	@ApiProperty({
		example: 'mustermannsmax',
		description: 'The name of the user',
	})
	readonly username!: string;

	@ApiProperty({
		example: '23q48xfm345v987251um8235vz78924tr5z',
		description: 'The encrypted password of the user',
	})
	readonly password!: string;
}
