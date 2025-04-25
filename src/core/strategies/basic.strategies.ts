import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { setting } from '../../setting';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      passReqToCallback: true,
    });
  }

  public validate = async (req, username, password): Promise<boolean> => {
    if (setting.Username === username && setting.Password === password) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  };
}
