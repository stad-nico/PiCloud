import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/modules/user/users.service';

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

    return await this.jwtService.signAsync(result);
}

}