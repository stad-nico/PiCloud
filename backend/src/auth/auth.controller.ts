import { Body, Controller, HttpCode, Post, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
  ) {
    const token = await this.authService.login(loginDto.username, loginDto.password);

    return token;
  }

}