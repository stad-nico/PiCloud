/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Samuel Steger. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponse {
	@ApiProperty({
		example: 'invfqcd8z4rtvn26738rfmgvjjioh423tb3hbjogfdwbs1',
		description: 'The new access token',
	})
	readonly accessToken!: string;

	@ApiProperty({
		example: 'invfqcd8z4rtvn26738rfmgvjjioh423tb3hbjogfdwbs1',
		description: 'The new refresh token used to generate a new access token',
	})
	readonly refreshToken!: string;

	private constructor(accessToken: string, refreshToken: string) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}

	public static from(accessToken: string, refreshToken: string) {
		return new RefreshResponse(accessToken, refreshToken);
	}
}
