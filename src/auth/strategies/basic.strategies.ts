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
    console.log(username, password);
    console.log(setting.Username);
    console.log(setting.Password);
    console.log(setting.Username === username);
    console.log(setting.Password === password);
    if (setting.Username === username && setting.Password === password) {
      console.log(username, password);
      return true;
    } else {
      throw new UnauthorizedException();
    }
  };
}
