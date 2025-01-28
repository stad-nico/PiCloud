import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/user/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from './jwt/jwt.service';

@Module({
	imports: [UsersModule],
	controllers: [AuthController],
	providers: [AuthService, JwtService],
})
export class AuthModule {}
