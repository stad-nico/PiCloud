import { Body, Controller, Get, HttpException, Logger, Param, Post } from '@nestjs/common';
import { User } from 'src/db/entities/user.entitiy';
import { Public } from 'src/shared/decorators/public.decorator';
import { SomethingWentWrongException } from 'src/shared/exceptions';
import { CreateUserDto } from './dtos/createUser.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	private readonly logger = new Logger(UsersController.name);

	constructor(private usersService: UsersService) {}

	@Get(':id')
	public async getUser(@Param('id') userId: string): Promise<User> {
		this.logger.log(`[Get] ${userId}`);

		try {
			return await this.usersService.getUser(userId);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}

	@Post()
	@Public()
	public async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
		this.logger.log(`[Post] ${createUserDto.username}`);

		try {
			return await this.usersService.createUser(createUserDto);
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}
}
