/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Samuel Steger
 *-------------------------------------------------------------------------*/
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Directory } from 'src/db/entities/directory.entity';
import { User } from 'src/db/entities/user.entitiy';
import { UserService } from 'src/modules/users/user.service';
import { UsersController } from './users.controller';

@Module({
	imports: [MikroOrmModule.forFeature([User, Directory])],
	providers: [UserService],
	controllers: [UsersController],
})
export class UsersModule {}
