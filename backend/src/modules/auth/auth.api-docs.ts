/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginResponse } from 'src/modules/auth/mapping/login/login.response';
import { RefreshResponse } from 'src/modules/auth/mapping/refresh/refresh.response';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';
import { TemplatedApiException } from 'src/util/SwaggerUtils';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
import { IncorrectPasswordException } from './exceptions/incorrect-password.exception';
import { TokenExpiredException } from './exceptions/token-expired.exception';
import { LoginBody } from './mapping/login/login.body';
import { RefreshBody } from './mapping/refresh/refresh.body';

export class AuthApiDocs {
	public static controller() {
		return applyDecorators(ApiTags('auth'), ApiBearerAuth());
	}

	public static login() {
		return applyDecorators(
			ApiBody({ description: 'The login credentials', type: LoginBody }),
			ApiOperation({
				operationId: 'login',
				summary: 'Login with password',
				description: 'Generate refresh and access token',
			}),
			ApiOkResponse({ type: LoginResponse, description: 'The login was successful' }),
			TemplatedApiException(() => new UserNotFoundException('exampleUser'), { description: 'User does not exist' }),
			TemplatedApiException(() => IncorrectPasswordException, { description: 'The password was not correct' }),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static refresh() {
		return applyDecorators(
			ApiBody({ description: 'The refresh token', type: RefreshBody }),
			ApiOperation({
				operationId: 'refresh',
				summary: 'Refresh with refresh token',
				description: 'Generate new access and refresh token',
			}),
			ApiOkResponse({ type: RefreshResponse, description: 'new tokens generated' }),
			TemplatedApiException(() => new UserNotFoundException('exampleUser'), { description: 'User does not exist' }),
			TemplatedApiException(() => TokenExpiredException, { description: 'The token has expired' })
		);
	}
}
