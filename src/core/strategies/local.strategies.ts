import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../../features/auth/aplication/service/auth.service';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategies extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }
  async validate(loginOrEmail: string): Promise<any> {
    const result = await this.authService.validateUserByLogin(loginOrEmail);
    const userId: string = result.data;
    if (!userId) {
      throw new UnauthorizedException();
    }
    return { id: userId };
  }
}
