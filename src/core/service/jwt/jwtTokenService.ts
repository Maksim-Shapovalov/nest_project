import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtConfig } from '../../config/JwtConfig';
export class AccessTokenPayload {
  userId: string;
}

export class RefreshTokenPayload extends AccessTokenPayload {
  deviceId: string;
  iat?: number;
  exp?: number;
}
@Injectable()
export class JwtTokenService {
  constructor(
    private nestJwtService: JwtService,
    private jwtConfig: JwtConfig,
  ) {}

  async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
    // const options: JwtSignOptions = {
    //   expiresIn: this.jwtConfig.jwtAccessExpirationTime,
    // };
    // console.log(32);
    // console.log(options);
    return this.nestJwtService.signAsync(payload, {
      secret: this.jwtConfig.jwtSecret,
      expiresIn: this.jwtConfig.jwtAccessExpirationTime,
    });
  }

  async generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    // const options: JwtSignOptions = {
    //   expiresIn: this.jwtConfig.jwtRefreshExpirationTime,
    // };

    return this.nestJwtService.signAsync(payload, {
      secret: this.jwtConfig.jwtSecret,
      expiresIn: this.jwtConfig.jwtAccessExpirationTime,
    });
  }

  async verify<T extends object = any>(token: string): Promise<T> {
    return this.nestJwtService.verify<T>(token);
  }

  async decode<T extends object = any>(token: string): Promise<T | null> {
    return this.nestJwtService.decode(token) as T | null;
  }
}
