import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../Users/User.repository';
import { setting } from '../../setting';
import { UserDbType } from '../../Users/Type/User.type';

@Injectable()
export class SoftAuthGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected userRepository: UserRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (token) {
      try {
        const decodedToken = this.jwtService.verify(
          token.replace('Bearer ', ''),
          { secret: setting.JWT_SECRET },
        );
        const userId = decodedToken.userId;

        const user = await this.userRepository.getUserById(userId);
        if (user) {
          request.user = UserDbType.UserInReqMapper(user);
        }
      } catch (error) {
        return true;
      }
    }

    return true;
  }
}
