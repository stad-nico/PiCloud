/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { CreateUserBody } from 'src/modules/users/mapping/create/create-user.body';

export class CreateUserDto {
	public readonly username!: string;

	public readonly password!: string;

	private constructor(username: string, password: string) {
		this.username = username;
		this.password = password;
	}

	public static from(body: CreateUserBody): CreateUserDto {
		return new CreateUserDto(body.username, body.password);
	}
}
