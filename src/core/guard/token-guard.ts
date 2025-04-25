import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PayloadTypeRefresh } from '../../features/validate-middleware/refreshToken-type';
import { setting } from '../../setting';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SecurityDevicesSQLTypeOrmRepository } from '../../features/device/infrastructure/Device.repo.TypeOrm';
import { JwtConfig } from '../config/JwtConfig';

export interface CustomRequest extends Request {
  token: {
    userId: string;
    deviceId: string;
  };
  cookies: {
    [key: string]: string;
  };
}

@Injectable()
export class TokenRefreshGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    private jwtConfig: JwtConfig,
    // @InjectModel(RefreshToken.name)
    // protected tokenRefreshModel: Model<RefreshTokenDocuments>,
    @InjectDataSource() protected dataSource: DataSource,
    protected securityDevicesSQLTypeOrmRepository: SecurityDevicesSQLTypeOrmRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as CustomRequest;
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    let parser;
    try {
      parser = await this.jwtService.verify(refreshToken, {
        secret: this.jwtConfig.jwtSecret,
      });
      const validToken2: PayloadTypeRefresh =
        await this.securityDevicesSQLTypeOrmRepository.getDeviceByIdDeviceAndUSerID(
          parser.deviceId,
          parser.userId,
        );

      // await this.dataSource.query(
      //   `SELECT * FROM "device_entity" WHERE "userId" = ${parser.userId} AND "deviceId" = ${parser.deviceId}`,
      // );
      const validToken1 = validToken2[0];
      if (!validToken1) throw new ForbiddenException();
      if (validToken1.iat === parser.iat) {
        request.token = {
          userId: validToken1.userId,
          deviceId: validToken1.deviceId,
        };
        return true;
      }
      throw new UnauthorizedException();
      // jwt.verify(refreshToken) as PayloadTypeRefresh;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
