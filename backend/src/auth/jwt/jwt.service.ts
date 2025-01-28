import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from 'src/config/jwt.config';

@Injectable()
export class JwtService {
  private readonly accessTokenConfig;
  private readonly refreshTokenConfig;

  constructor(private readonly configService: ConfigService) {
    const jwtConfigs = jwtConfig(this.configService);
    this.accessTokenConfig = jwtConfigs.accessToken;
    this.refreshTokenConfig = jwtConfigs.refreshToken;
  }

  generateAccessToken(payload: object): string {
    return jwt.sign(payload, this.accessTokenConfig.secret, {
      expiresIn: this.accessTokenConfig.expiresIn,
    });
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.refreshTokenConfig.secret, {
      expiresIn: this.refreshTokenConfig.expiresIn,
    });
  }
}
