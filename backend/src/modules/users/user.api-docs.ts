/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserAlreadyExistsException } from 'src/modules/users/exceptions/user-already-exists.exception';
import { UserNotFoundException } from 'src/modules/users/exceptions/user-not-found.exception';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';
import { TemplatedApiException } from 'src/util/SwaggerUtils';

export class UserApiDocs {
	public static controller() {
		return applyDecorators(ApiTags('users'), ApiBearerAuth());
	}

	public static get() {
		return applyDecorators(
			ApiOperation({
				operationId: 'get',
				summary: 'Get user',
				description: 'Get information about the user',
			}),
			ApiOkResponse({ description: 'The user metadata was retreived successfully' }),
			TemplatedApiException(() => new UserNotFoundException('133a8736-111a-4cf7-ae84-dbe040ad4382'), {
				description: 'The user does not exist',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}

	public static create() {
		return applyDecorators(
			ApiOperation({
				operationId: 'createUser',
				summary: 'Create user',
				description: 'Register a new user',
			}),
			ApiCreatedResponse({ description: 'The user was created successfully' }),
			TemplatedApiException(() => new UserAlreadyExistsException('exampleUser'), {
				description: 'User with this username already exists',
			}),
			TemplatedApiException(() => SomethingWentWrongException, { description: 'Unexpected error' })
		);
	}
}
