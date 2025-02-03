/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { CreateUserBody } from 'src/modules/users/mapping/create/create-user.body';
import { CreateUserDto } from 'src/modules/users/mapping/create/create-user.dto';
import { GetUserDto } from 'src/modules/users/mapping/get-user/get-user.dto';
import { GetUserParams } from 'src/modules/users/mapping/get-user/get-user.params';
import { GetUserResponse } from 'src/modules/users/mapping/get-user/get-user.response';
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
	public async get(@Param() getUserParams: GetUserParams): Promise<GetUserResponse> {
		this.logger.log(`[Get] ${getUserParams.id}`);

		try {
			const getUserDto = GetUserDto.from(getUserParams);

			return await this.userService.getUser(getUserDto);
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
	@HttpCode(HttpStatus.CREATED)
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
