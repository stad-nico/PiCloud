/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Samuel Steger. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { UnauthorizedException } from '@nestjs/common';

export class TokenExpiredException extends UnauthorizedException {
	public constructor() {
		super('token expired');
	}
}
