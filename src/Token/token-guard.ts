import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PayloadTypeRefresh } from './refreshToken-type';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocuments } from './Token.schema';
import { Model } from 'mongoose';
import { setting } from '../setting';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SecurityDevicesSQLTypeOrmRepository } from '../Device/TypeOrm/Device.repo.TypeOrm';

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
    @InjectModel(RefreshToken.name)
    protected tokenRefreshModel: Model<RefreshTokenDocuments>,
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
        secret: setting.JWT_REFRESH_SECRET,
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
