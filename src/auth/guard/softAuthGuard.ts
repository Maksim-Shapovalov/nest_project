import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { setting } from '../../setting';
import { UserDbType } from '../../Users/Type/User.type';
import { UserSQLTypeOrmRepository } from '../../Users/TypeORM/User.repo.TypeORm';

@Injectable()
export class SoftAuthGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected userSQLRepository: UserSQLTypeOrmRepository,
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
        const user = await this.userSQLRepository.getUserById(userId);
        if (user) {
          request.user = UserDbType.UserInReqMapper(user);
          return true;
        }
      } catch (error) {
        return true;
      }
    } else {
      request.user = null;
      return true;
    }
  }
}
