import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/modules/user/users.service';
import { JwtService } from './jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async login(username: string, pass: string) {
    const user = await this.usersService.findOneByUsername(username);

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