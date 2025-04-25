import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { setting } from '../../setting';
import { UserSQLTypeOrmRepository } from '../../features/users/infrastrucrue/User.repo.TypeORm';

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

      const user = await this.userSQLRepository.getUserById(userId);
      if (!user) throw new Error();

      request.user = {
        userId: user.getId(),
        addedAt: user.getCreatedAt(),
        login: user.getLogin(),
      };
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
