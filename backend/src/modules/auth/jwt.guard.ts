/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { Environment } from 'src/config/env.config';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';
import { TokenExpiredException } from './exceptions/token-expired.exception';

declare module 'express' {
	export interface Request {
		jwtPayload?: JwtPayload;
	}
}

export interface JwtPayload {
	readonly user: {
		id: string;
		username: string;
	};
}

@Injectable()
export class JwtGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly reflector: Reflector
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();

		const isPublic = this.isEndpointPublic(context);

		if (isPublic) {
			return true;
		}

		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException();
		}

		try {
			const secret = this.configService.getOrThrow<string>(Environment.JwtAccessSecret);

			const payload = await this.jwtService.verifyAsync<JwtPayload>(token, { secret });

			request.jwtPayload = payload;
		} catch (err) {
			if (err instanceof TokenExpiredError) {
				throw new TokenExpiredException();
			} else {
				throw new UnauthorizedException();
			}
		}

		return true;
	}

	private isEndpointPublic(context: ExecutionContext) {
		return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler()]);
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
