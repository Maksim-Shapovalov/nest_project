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
    userId: number;
    deviceId: number;
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
    console.log(refreshToken);
    if (!refreshToken) throw new UnauthorizedException();
    console.log(1);
    let parser;
    console.log(2);
    try {
      parser = await this.jwtService.verify(refreshToken, {
        secret: setting.JWT_REFRESH_SECRET,
      });
      console.log(parser, 'parser');
      const validToken2: PayloadTypeRefresh =
        await this.securityDevicesSQLTypeOrmRepository.getDeviceByIdDeviceAndUSerID(
          parser.deviceId,
          parser.userId,
        );
      console.log(validToken2, 'validToken2');

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
      console.log(3);
      throw new UnauthorizedException();
      // jwt.verify(refreshToken) as PayloadTypeRefresh;
    } catch (e) {
      console.log(4);
      throw new UnauthorizedException();
    }
  }
}
