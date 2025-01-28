/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { User } from 'src/db/entities/user.entitiy';
import { CreateUserDto } from './dtos/createUser.dto';

@Injectable()
export class UsersService {
    
    constructor(
        private readonly entityManager: EntityManager
    ) {}

    async createUser(createUserDto: CreateUserDto) {

        const existingUser = await this.findOneByUsername(createUserDto.username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const cryptedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = new User();
        user.username = createUserDto.username;
        user.password = cryptedPassword;

        console.log(user);
        await this.entityManager.persistAndFlush(user);
        return user;
    }

    async findOneByUsername(username: string) {
        return await this.entityManager.findOne(User, { username });
    }

    async findOneById(id: string) {
        return await this.entityManager.findOne(User, { id });
    }
}

