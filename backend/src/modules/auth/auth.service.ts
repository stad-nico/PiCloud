/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Transactional } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {

	private static ACCESS_TOKEN_EXPIRATION: string = '15m';
	private static REFRESH_TOKEN_EXPIRATION: string = '7d';

	constructor(
		private readonly userRepository: UserRepository,
		private readonly configService: ConfigService
	) {}

	@Transactional()
	public async login(loginDto: LoginDto) {
		const user = await this.userRepository.findOne({ username: loginDto.username });

		if (!user) {
			throw new UserNotFoundException(loginDto.username);
		}

		const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

		if (!isPasswordValid) {
			throw new IncorrectPasswordException();
		}

		const jwtPayload: JwtPayload = { user: { id: user.id, username: user.username } };

		const accessToken = jwt.sign(jwtPayload, this.configService.getOrThrow<string>(Environment.JwtAccessSecret), { expiresIn: '15m' });

		const refreshToken = jwt.sign(jwtPayload, this.configService.getOrThrow<string>(Environment.JwtRefreshSecret), { expiresIn: '7d' });

		return LoginResponse.from(accessToken, refreshToken);
	}
}
