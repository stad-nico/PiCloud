import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/modules/user/users.repository';
import { JwtService } from './jwt/jwt.service';

@Injectable()
export class AuthService {
	constructor(
		private userRepository: UserRepository,
		private jwtService: JwtService
	) {}

	public async login(username: string, pass: string) {
		const user = await this.userRepository.findOne({ username: username });

		if (!user) {
			throw new UnauthorizedException('Invalid username or password');
		}

		const isPasswordValid = await bcrypt.compare(pass, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid username or password');
		}

		const { password, ...result } = user;

		const accessToken = this.jwtService.generateAccessToken({ user: result });
		const refreshToken = this.jwtService.generateRefreshToken({ user: result });

		return { accessToken, refreshToken };
	}
}
