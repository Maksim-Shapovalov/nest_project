import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { setting } from '../../setting';
import { UserDbType } from '../../Users/Type/User.type';
import { UserSQLRepository } from '../../Users/User.SqlRepositories';

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
    protected userSQLRepository: UserSQLRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (!token) throw new UnauthorizedException();
    console.log(1, token);

    try {
      console.log(523523);
      const decodedToken = this.jwtService.verify(
        token.replace('Bearer ', ''),
        { secret: setting.JWT_SECRET },
      );
      console.log(decodedToken);
      console.log(2);
      const userId = decodedToken.userId;

      const user = await this.userSQLRepository.getUserById(+userId);
      console.log(3);
      if (!user) throw new Error();
      console.log(4);

      const mapUser = UserDbType.UserInReqMapper(user);
      request.user = mapUser;
    } catch (error) {
      console.log(5);
      throw new UnauthorizedException();
    }

    return true;
  }
}
