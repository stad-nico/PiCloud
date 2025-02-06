/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { LoginBody } from 'src/modules/auth/mapping/login/login.body';

export class LoginDto {
	readonly username: string;

	readonly password: string;

	private constructor(username: string, password: string) {
		this.username = username;
		this.password = password;
	}

	public static from(loginBody: LoginBody): LoginDto {
		return new LoginDto(loginBody.username, loginBody.password);
	}
}
