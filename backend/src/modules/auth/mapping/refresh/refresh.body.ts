/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Samuel Steger. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

export class RefreshBody {
	@ApiProperty({
		example: 'invfqcd8z4rtvn26738rfmgvjjioh423tb3hbjogfdwbs1',
		description: 'The refresh token used to generate a new access token',
	})
	readonly refreshToken!: string;
}
