/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { Transactional } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/db/entities/user.entitiy';
import { DirectoryRepository } from 'src/modules/directories/directory.repository';
import { UserAlreadyExistsException } from 'src/shared/exceptions/UserAlreadyExistsException';
import { UserNotFoundException } from 'src/shared/exceptions/UserNotFoundException';
import { CreateUserDto } from './dtos/createUser.dto';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
	constructor(
		private readonly directoryRepository: DirectoryRepository,
		private readonly userRepository: UserRepository
	) {}

	@Transactional()
	public async getUser(userId: string): Promise<User> {
		const user = await this.userRepository.findOne({ id: userId });

		if (!user) {
			throw new UserNotFoundException(userId);
		}

		return user;
	}

	@Transactional()
	public async createUser(createUserDto: CreateUserDto): Promise<void> {
		const existingUser = await this.userRepository.findOne({ username: createUserDto.username });

		if (existingUser) {
			throw new UserAlreadyExistsException(existingUser.username);
		}

		const cryptedPassword = await bcrypt.hash(createUserDto.password, 10);

		const user = this.userRepository.create({ username: createUserDto.username, password: cryptedPassword });

		this.directoryRepository.create({ parent: null, name: 'root', user: user });
	}
}
