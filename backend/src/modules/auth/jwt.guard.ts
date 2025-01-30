/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Environment } from 'src/config/env.config';
import { User } from 'src/db/entities/user.entitiy';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';

export interface JwtPayload {
	readonly user: Pick<User, 'id' | 'createdAt' | 'username'>;
}

@Injectable()
export class JwtGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private configService: ConfigService,
		private reflector: Reflector
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const isPublic = this.isEndpointPublic(context);

		if (isPublic) {
			return true;
		}

		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException();
		}

		try {
			const secret = this.configService.get<string>(Environment.JwtAccessSecret)!;

			const payload = await this.jwtService.verifyAsync<JwtPayload>(token, { secret });

			request.jwtPayload = payload;
		} catch {
			throw new UnauthorizedException();
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
