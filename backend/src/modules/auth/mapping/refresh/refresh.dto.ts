/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Samuel Steger. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { RefreshBody } from './refresh.body';

export class RefreshDto {
	readonly refreshToken: string;

	private constructor(refreshToken: string) {
		this.refreshToken = refreshToken;
	}

	public static from(refreshBody: RefreshBody) {
		return new RefreshDto(refreshBody.refreshToken);
	}
}
