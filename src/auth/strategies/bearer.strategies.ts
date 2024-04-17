import { injectable } from 'inversify';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { setting } from '../../setting';

@injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: setting.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.userId, expiresIn: payload.expiresIn };
  }
}
