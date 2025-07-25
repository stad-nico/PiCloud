/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Samuel Steger. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { Body, Controller, HttpCode, HttpException, HttpStatus, Logger, Post } from '@nestjs/common';
import { AuthApiDocs } from 'src/modules/auth/auth.api-docs';
import { LoginBody } from 'src/modules/auth/mapping/login/login.body';
import { LoginDto } from 'src/modules/auth/mapping/login/login.dto';
import { LoginResponse } from 'src/modules/auth/mapping/login/login.response';
import { RefreshResponse } from 'src/modules/auth/mapping/refresh/refresh.response';
import { Public } from 'src/shared/decorators/public.decorator';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';
import { AuthService } from './auth.service';
import { RefreshBody } from './mapping/refresh/refresh.body';
import { RefreshDto } from './mapping/refresh/refresh.dto';

@Controller('auth')
@AuthApiDocs.controller()
export class AuthController {
	private readonly logger = new Logger(AuthController.name);

	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@Public()
	@HttpCode(HttpStatus.OK)
	@AuthApiDocs.login()
	async login(@Body() loginBody: LoginBody): Promise<LoginResponse> {
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

	@Post('refresh')
	@Public()
	@HttpCode(HttpStatus.OK)
	@AuthApiDocs.refresh()
	async refresh(@Body() refreshBody: RefreshBody): Promise<RefreshResponse> {
		this.logger.log(`[Post] refresh`);

		try {
			const refreshDto = RefreshDto.from(refreshBody);

			return await this.authService.refresh(refreshDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}
}
