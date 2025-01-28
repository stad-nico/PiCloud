/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { EntityManager, Transactional } from '@mikro-orm/mariadb';
import { Injectable } from '@nestjs/common';
import { User } from 'src/db/entities/user.entitiy';
import { UserNotFoundException } from 'src/shared/exceptions/UserNotFoundException';
import { CreateUserDto } from './dtos/createUser.dto';
import { UsersRepository } from './users.repository';

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
		// return await this.entityManager.transactional(async (entityManager: EntityManager) => {
		// const existingUser = await this.usersRepository.findOneByUsername(entityManager, createUserDto.username);
		this.entityManager.create(User, { username: createUserDto.username, password: 'password' });

		// if (existingUser) {
		// throw new UserAlreadyExistsException(existingUser.username);
		// }

		// const cryptedPassword = await bcrypt.hash(createUserDto.password, 10);

		const user = Object.assign(new User(), { username: createUserDto.username, password: 'password' });
		// });
	}
}
