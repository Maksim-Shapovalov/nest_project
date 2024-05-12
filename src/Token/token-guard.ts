import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshTokenRepo } from './refreshToken-repo';
import jwt from 'jsonwebtoken';
import { PayloadTypeRefresh } from './refreshToken-type';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocuments } from './Token.schema';
import { Model } from 'mongoose';
import { setting } from '../setting';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as CustomRequest;
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    let parser;
    try {
      parser = this.jwtService.verify(refreshToken, {
        secret: setting.JWT_REFRESH_SECRET,
      });
      console.log(1, parser);
      const validToken2: PayloadTypeRefresh = await this.dataSource.query(
        `SELECT * FROM "device" WHERE "userId" = ${parser.userId} AND "deviceId" = ${parser.deviceId}`,
      );
      const validToken1 = validToken2[0];
      console.log(2, validToken1);
      // const validToken: PayloadTypeRefresh =
      //   await this.tokenRefreshModel.findOne({
      //     userId: parser.userId,
      //     deviceId: parser.deviceId,
      //   });

      if (!validToken1) throw new UnauthorizedException();
      console.log(3);
      if (validToken1.iat === parser.iat) {
        request.token = {
          userId: validToken1.userId,
          deviceId: validToken1.deviceId,
        };
        console.log(4);
        return true;
      }
      throw new UnauthorizedException();
      // jwt.verify(refreshToken) as PayloadTypeRefresh;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
