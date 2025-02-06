/**-------------------------------------------------------------------------
 * Copyright (c) 2025 - Nicolas Stadler. All rights reserved.
 * Licensed under the MIT License. See the project root for more information.
 *
 * @author Nicolas Stadler
 *-------------------------------------------------------------------------*/
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from 'src/db/entities/user.entitiy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [MikroOrmModule.forFeature([User])],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule {}
