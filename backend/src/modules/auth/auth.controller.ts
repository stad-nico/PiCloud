import { Body, Controller, HttpCode, HttpException, HttpStatus, Logger, Post } from '@nestjs/common';
import { Public } from 'src/shared/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { TemplatedApiException } from 'src/util/SwaggerUtils';
import { InvalidPasswordException } from './exceptions/InvalidPassword.exception';
import { InvalidUsernameException } from './exceptions/InvalidUsername.exception';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';

@Controller('auth')
export class AuthController {

	constructor(private authService: AuthService) {}

	private readonly logger = new Logger(AuthController.name);

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ operationId: 'login', summary: 'Login with username and password', description: 'Login with username and password, for tokens'})
	@ApiCreatedResponse({ description: 'The user has succesfully logged in'})
	@TemplatedApiException(() => new InvalidPasswordException(), { description: 'The password is invalid'})
	@TemplatedApiException(() => new InvalidUsernameException, { description: 'This username does not exist'})
	@Public()
	async login(@Body() loginDto: LoginDto) {
		this.logger.log(`[POST] ${loginDto.username}`);

		try {
			return await this.authService.login(loginDto.username, loginDto.password);
		} catch (e) {
			this.logger.error(e);
			
			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}

	}
}
