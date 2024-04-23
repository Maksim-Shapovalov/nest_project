import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../Users/User.repository';
import { setting } from '../../setting';
import { UserDbType } from '../../Users/Type/User.type';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    throw new UnauthorizedException();
  }
}
// @Injectable()
// export class AuthGuardLikes implements CanActivate {
//   canActivate(
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     // const request = context.switchToHttp().getRequest();
//     throw new UnauthorizedException();
//   }
// }

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

@Injectable()
export class BearerGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected userRepository: UserRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (!token) throw new UnauthorizedException();

    try {
      const decodedToken = this.jwtService.verify(
        token.replace('Bearer ', ''),
        { secret: setting.JWT_SECRET },
      );
      const userId = decodedToken.userId;

      const user = await this.userRepository.getUserById(userId);
      if (!user) throw new Error();

      const mapUser = UserDbType.UserInReqMapper(user);
      request.user = mapUser;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
