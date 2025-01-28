import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from 'src/shared/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('login')
	@Public()
	@HttpCode(200)
	async login(@Body() loginDto: LoginDto) {
		const token = await this.authService.login(loginDto.username, loginDto.password);

		return token;
	}
}
