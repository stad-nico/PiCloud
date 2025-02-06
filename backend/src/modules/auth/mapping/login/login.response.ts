/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
export class LoginResponse {
	readonly accessToken!: string;

	readonly refreshToken!: string;

	private constructor(accessToken: string, refreshToken: string) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}

	public static from(accessToken: string, refreshToken: string) {
		return new LoginResponse(accessToken, refreshToken);
	}
}
