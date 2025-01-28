/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { EntityManager, Transactional } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';
import { User } from 'src/db/entities/user.entitiy';
import { UserNotFoundException } from 'src/modules/user/exceptions/UserNotFoundException';
import { CreateUserDto } from './dtos/createUser.dto';
import { UsersRepository } from './users.repository';
import { UserAlreadyExistsException } from 'src/modules/user/exceptions/UserAlreadyExistsException';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(
		private readonly entityManager: EntityManager,
		private readonly usersRepository: UsersRepository
	) {}

	public async getUser(userId: string): Promise<User> {
		return await this.entityManager.transactional(async (entityManager: EntityManager) => {
			const user = await this.usersRepository.findOneById(entityManager, userId);

			if (!user) {
				throw new UserNotFoundException(userId);
			}

			return user;
		});
	}

	@Transactional()
	public async createUser(createUserDto: CreateUserDto): Promise<void> {
		const existingUser = await this.usersRepository.findOneByUsername(this.entityManager, createUserDto.username);

		if (existingUser) {
			throw new UserAlreadyExistsException(existingUser.username);
		}

		const cryptedPassword = await bcrypt.hash(createUserDto.password, 10);

		const user = this.entityManager.create(User, {
			username: createUserDto.username,
			password: cryptedPassword
		});
	
		await this.entityManager.persistAndFlush(user);
	}
}
