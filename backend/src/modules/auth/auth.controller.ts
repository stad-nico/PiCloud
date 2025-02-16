/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Body, Controller, HttpCode, HttpException, HttpStatus, Logger, Post } from '@nestjs/common';
import { AuthApiDocs } from 'src/modules/auth/auth.api-docs';
import { LoginBody } from 'src/modules/auth/mapping/login/login.body';
import { LoginDto } from 'src/modules/auth/mapping/login/login.dto';
import { Public } from 'src/shared/decorators/public.decorator';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';
import { AuthService } from './auth.service';

@Controller('auth')
@AuthApiDocs.controller()
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ operationId: 'login', summary: 'Login with username and password', description: 'Login with username and password, for tokens'})
	@ApiCreatedResponse({ description: 'The user has succesfully logged in'})
	@TemplatedApiException(() => new InvalidPasswordException(), { description: 'The password is invalid'})
	@TemplatedApiException(() => new InvalidUsernameException, { description: 'This username does not exist'})
	@Public()
	@HttpCode(HttpStatus.OK)
	@AuthApiDocs.login()
	async login(@Body() loginBody: LoginBody) {
		this.logger.log(`[Post] ${loginBody.username}`);

		try {
			const loginDto = LoginDto.from(loginBody);

			return await this.authService.login(loginDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}
}
