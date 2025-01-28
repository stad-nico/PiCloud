import { EntityManager } from '@mikro-orm/mariadb';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from 'src/modules/user/users.repository';
import { JwtService } from './jwt/jwt.service';

@Injectable()
export class AuthService {
	constructor(
		private usersRepository: UsersRepository,
		private jwtService: JwtService,
		private entityManager: EntityManager
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

		const accessToken = this.jwtService.generateAccessToken(result);
		const refreshToken = this.jwtService.generateRefreshToken(result);

		return { accessToken, refreshToken };
	}
}
