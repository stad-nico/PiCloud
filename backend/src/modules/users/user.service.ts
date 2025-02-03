/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Samuel Steger. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { Transactional } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DirectoryRepository } from 'src/modules/directories/directory.repository';
import { UserAlreadyExistsException } from 'src/modules/users/exceptions/user-already-exists.exception';
import { UserNotFoundException } from 'src/modules/users/exceptions/user-not-found.exception';
import { CreateUserDto } from 'src/modules/users/mapping/create/create-user.dto';
import { GetUserDto } from 'src/modules/users/mapping/get-user/get-user.dto';
import { GetUserResponse } from 'src/modules/users/mapping/get-user/get-user.response';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
	constructor(
		private readonly directoryRepository: DirectoryRepository,
		private readonly userRepository: UserRepository
	) {}

	@Transactional()
	public async getUser(getUserDto: GetUserDto): Promise<GetUserResponse> {
		const user = await this.userRepository.findOne({ id: getUserDto.id });

		if (!user) {
			throw new UserNotFoundException(getUserDto.id);
		}

		return GetUserResponse.from(user);
	}

	@Transactional()
	public async create(createUserDto: CreateUserDto): Promise<void> {
		const existingUser = await this.userRepository.findOne({ username: createUserDto.username });

		if (existingUser) {
			throw new UserAlreadyExistsException(existingUser.username);
		}

		const cryptedPassword = await bcrypt.hash(createUserDto.password, 10);

		const user = this.userRepository.create({ username: createUserDto.username, password: cryptedPassword });

		this.directoryRepository.create({ parent: null, name: 'root', user: user });
	}
}
