/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Samuel Steger. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { Transactional } from '@mikro-orm/core';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Environment } from 'src/config/env.config';
import { IncorrectPasswordException } from 'src/modules/auth/exceptions/incorrect-password.exception';
import { JwtPayload } from 'src/modules/auth/jwt.guard';
import { LoginDto } from 'src/modules/auth/mapping/login/login.dto';
import { LoginResponse } from 'src/modules/auth/mapping/login/login.response';
import { UserNotFoundException } from 'src/modules/users/exceptions/user-not-found.exception';
import { UserRepository } from 'src/modules/users/user.repository';
import { RefreshDto } from './mapping/refresh/refresh.dto';
import { RefreshResponse } from './mapping/refresh/refresh.response';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { TokenExpiredException } from './exceptions/token-expired.exception';

@Injectable()
export class AuthService {
	private static ACCESS_TOKEN_EXPIRATION: string = '15m';
	private static REFRESH_TOKEN_EXPIRATION: string = '7d';

	constructor(
		private readonly userRepository: UserRepository,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService
	) {}

	@Transactional()
	public async login(loginDto: LoginDto): Promise<LoginResponse> {
		const user = await this.userRepository.findOne({ username: loginDto.username });

		if (!user) {
			throw new UserNotFoundException(loginDto.username);
		}

		const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

		if (!isPasswordValid) {
			throw new IncorrectPasswordException();
		}

		const jwtPayload: JwtPayload = { user: { id: user.id, username: user.username } };

		const accessToken = jwt.sign(jwtPayload, this.configService.getOrThrow<string>(Environment.JwtAccessSecret), {
			expiresIn: AuthService.ACCESS_TOKEN_EXPIRATION,
		});

		const refreshToken = jwt.sign(jwtPayload, this.configService.getOrThrow<string>(Environment.JwtRefreshSecret), {
			expiresIn: AuthService.REFRESH_TOKEN_EXPIRATION,
		});

		return LoginResponse.from(accessToken, refreshToken);
	}

	@Transactional()
	public async refresh(refreshDto: RefreshDto): Promise<RefreshResponse> {
		try {
			const secret = this.configService.getOrThrow<string>(Environment.JwtRefreshSecret);

			const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshDto.refreshToken, { secret });

			const user = await this.userRepository.findOne({ id: payload.user.id });

			if (!user) {
				throw new UserNotFoundException(payload.user.id);
			}

			const jwtPayload: JwtPayload = { user: { id: user.id, username: user.username } };

			const accessToken = jwt.sign(jwtPayload, this.configService.getOrThrow<string>(Environment.JwtAccessSecret), {
				expiresIn: AuthService.ACCESS_TOKEN_EXPIRATION,
			});

			const refreshToken = jwt.sign(jwtPayload, this.configService.getOrThrow<string>(Environment.JwtRefreshSecret), {
				expiresIn: AuthService.REFRESH_TOKEN_EXPIRATION,
			});

			return RefreshResponse.from(accessToken, refreshToken);
		} catch (err) {
			if (err instanceof TokenExpiredError) {
				throw new TokenExpiredException();
			} else {
				throw new UnauthorizedException();
			}
		}
	}
}
