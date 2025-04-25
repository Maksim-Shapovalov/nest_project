import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserSQLTypeOrmRepository } from '../../features/users/infrastrucrue/User.repo.TypeORm';
import { JwtConfig } from '../config/JwtConfig';

@Injectable()
export class SoftAuthGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    private jwtConfig: JwtConfig,
    protected userSQLRepository: UserSQLTypeOrmRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (token) {
      try {
        const decodedToken = this.jwtService.verify(
          token.replace('Bearer ', ''),
          { secret: this.jwtConfig.jwtSecret },
        );
        const userId = decodedToken.userId;
        const user = await this.userSQLRepository.getUserById(userId);
        if (user) {
          request.user = {
            userId: user.getId(),
            addedAt: user.getCreatedAt(),
            login: user.getLogin(),
          };
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
