import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from 'src/db/entities/user.entitiy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from './jwt/jwt.service';

@Module({
	imports: [MikroOrmModule.forFeature([User])],
	controllers: [AuthController],
	providers: [AuthService, JwtService],
})
export class AuthModule {}
