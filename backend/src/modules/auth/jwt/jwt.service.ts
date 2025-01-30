/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { Environment } from 'src/config/env.config';

@Injectable()
export class JwtService {
	public static ACCESS_TOKEN_EXPIRATION: string = '7d';

	public static REFRESH_TOKEN_EXPIRATION: string = '7d';

	private readonly accessSecret: string;

	private readonly refreshSecret: string;

	constructor(configService: ConfigService) {
		this.accessSecret = configService.getOrThrow(Environment.JwtAccessSecret);
		this.refreshSecret = configService.getOrThrow(Environment.JwtRefreshSecret);
	}

	public generateAccessToken(payload: Record<string, unknown>): string {
		return jwt.sign(payload, this.accessSecret, {
			expiresIn: JwtService.ACCESS_TOKEN_EXPIRATION,
		});
	}

	public generateRefreshToken(payload: Record<string, unknown>): string {
		return jwt.sign(payload, this.refreshSecret, {
			expiresIn: JwtService.REFRESH_TOKEN_EXPIRATION,
		});
	}
}
