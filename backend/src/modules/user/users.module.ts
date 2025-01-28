/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/

import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from 'src/db/entities/user.entitiy';
import { UsersRepository } from 'src/modules/user/users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [MikroOrmModule.forFeature([User])],
	providers: [UsersService, UsersRepository],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
