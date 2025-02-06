/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Jwt = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest<Request>();

	if (!request.jwtPayload) {
		throw new Error(
			`No jwtPayload found on request. It seems like there is an endpoint that uses the @Jwt decorator that is not covered by the JwtGuard, e.g. marked as @Public()`
		);
	}

	return request.jwtPayload;
});
