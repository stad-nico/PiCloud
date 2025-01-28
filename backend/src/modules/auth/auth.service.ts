import { EntityManager } from '@mikro-orm/mariadb';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'src/modules/user/users.repository';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'src/config/env.config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {

	private static ACCESS_TOKEN_EXPIRATION: string = '15m';
	private static REFRESH_TOKEN_EXPIRATION: string = '7d';

	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly entityManager: EntityManager,
		private readonly configService: ConfigService,
	) {}

	public async login(username: string, pass: string) {
		const user = await this.usersRepository.findOneByUsername(this.entityManager, username);

		if (!user) {
			throw new UnauthorizedException('Invalid username or password');
		}

		const isPasswordValid = await bcrypt.compare(pass, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid username or password');
		}

		const { password, ...result } = user;
		const payload = { user: result };

		const accessSecret = this.configService.getOrThrow(Environment.JwtAccessSecret);
		const refreshSecret = this.configService.getOrThrow(Environment.JwtRefreshSecret);

		const accessToken = jwt.sign(payload, accessSecret, {
			expiresIn: AuthService.ACCESS_TOKEN_EXPIRATION,
		});

		const refreshToken = jwt.sign(payload, refreshSecret, {
			expiresIn: AuthService.REFRESH_TOKEN_EXPIRATION,
		})

		return { accessToken, refreshToken };
	}
}
