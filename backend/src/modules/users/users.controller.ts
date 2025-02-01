/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { User } from 'src/db/entities/user.entitiy';
import { CreateUserBody } from 'src/modules/users/mapping/create/create-user.body';
import { CreateUserDto } from 'src/modules/users/mapping/create/create-user.dto';
import { UserApiDocs } from 'src/modules/users/user.api-docs';
import { UserService } from 'src/modules/users/user.service';
import { Public } from 'src/shared/decorators/public.decorator';
import { SomethingWentWrongException } from 'src/shared/exceptions/SomethingWentWrongException';

@Controller('users')
@UserApiDocs.controller()
export class UsersController {
	private readonly logger = new Logger(UsersController.name);

	public constructor(private readonly userService: UserService) {}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	@UserApiDocs.get()
	public async get(@Param('id') userId: string): Promise<User> {
		this.logger.log(`[Get] ${userId}`);

		try {
			return await this.userService.getUser(userId);
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
	@UserApiDocs.create()
	public async create(@Body() createUserBody: CreateUserBody): Promise<void> {
		this.logger.log(`[Post] ${createUserBody.username}`);

		try {
			const createUserDto = CreateUserDto.from(createUserBody);

			await this.userService.create(createUserDto);
			return;
		} catch (e) {
			this.logger.error(e);

			if (e instanceof HttpException) {
				throw e;
			}

			throw new SomethingWentWrongException();
		}
	}
}
