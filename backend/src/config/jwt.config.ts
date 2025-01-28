import { ConfigService } from "@nestjs/config";

export const jwtConfig = (configService: ConfigService) => ({

  accessToken: {
    secret: configService.get<string>('JWT_ACCESS_SECRET') || 'default_access_secret',
    expiresIn: '15m',
  },

  refreshToken: {
    secret: configService.get<string>('JWT_REFRESH_SECRET') || 'default_refresh_secret',
    expiresIn: '7d',
  },
  
});
