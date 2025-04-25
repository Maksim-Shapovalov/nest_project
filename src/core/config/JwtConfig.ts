import { ConfigService } from '@nestjs/config';
import { configValidation } from './ConfigValidator';
import { Injectable } from '@nestjs/common';
import { IsString } from 'class-validator';

@Injectable()
export class JwtConfig {
  constructor(private configService: ConfigService<any, true>) {
    // console.log('in JwtConfig', configService);
    configValidation.validateConfig(this);
  }

  @IsString({
    message: 'Set Env variable JWT_SECRET, example: my_secret',
  })
  jwtSecret: string = this.configService.get<string>('JWT_SECRET');

  @IsString({
    message: 'Set Env variable JWT_ACCESS_EXPIRATION_TIME, example: 60s',
  })
  jwtAccessExpirationTime: string = this.configService.get<string>(
    'JWT_ACCESS_EXPIRATION_TIME',
  );

  @IsString({
    message: 'Set Env variable JWT_REFRESH_EXPIRATION_TIME, example: 5m',
  })
  jwtRefreshExpirationTime: string = this.configService.get<string>(
    'JWT_REFRESH_EXPIRATION_TIME',
  );
}
