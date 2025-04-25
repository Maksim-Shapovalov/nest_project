import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { setting } from '../../setting';
import { Injectable } from '@nestjs/common';
import { JwtConfig } from '../config/JwtConfig';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private jwtConfig: JwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.jwtSecret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId, expiresIn: payload.expiresIn };
  }
}
