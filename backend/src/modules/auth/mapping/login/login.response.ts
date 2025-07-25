import { ApiProperty } from '@nestjs/swagger';

/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
export class LoginResponse {
	@ApiProperty({
		example: 'invfqcd8z4rtvn26738rfmgvjjioh423tb3hbjogfdwbs1',
		description: 'The access token',
	})
	readonly accessToken!: string;

	@ApiProperty({
		example: 'invfqcd8z4rtvn26738rfmgvjjioh423tb3hbjogfdwbs1',
		description: 'The refresh token used to generate a new access token',
	})
	readonly refreshToken!: string;

	private constructor(accessToken: string, refreshToken: string) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}

	public static from(accessToken: string, refreshToken: string) {
		return new LoginResponse(accessToken, refreshToken);
	}
}
