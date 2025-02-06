/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { GetUserParams } from 'src/modules/users/mapping/get-user/get-user.params';

export class GetUserDto {
	readonly id: string;

	private constructor(userId: string) {
		this.id = userId;
	}

	public static from(getUserParams: GetUserParams): GetUserDto {
		return new GetUserDto(getUserParams.id);
	}
}
