import {
  Injectable,
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { setting } from '../../setting';
import { UserDbType } from '../../Users/Type/User.type';
import { UserSQLTypeOrmRepository } from '../../Users/TypeORM/User.repo.TypeORm';

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
    protected userSQLRepository: UserSQLTypeOrmRepository,
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

      const user = await this.userSQLRepository.getUserById(+userId);
      if (!user) throw new Error();

      const mapUser = UserDbType.UserInReqMapper(user);
      request.user = mapUser;
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
