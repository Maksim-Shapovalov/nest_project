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
      // jwt.verify(refreshToken) as PayloadTypeRefresh;
      console.log(parser, 'parser');
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }

    const validToken: PayloadTypeRefresh = await this.tokenRefreshModel.findOne(
      {
        userId: parser.userId,
        deviceId: parser.deviceId,
        iat: parser.iat,
      },
    );
    if (validToken.userId !== parser.userId) throw new ForbiddenException();
    if (!validToken) throw new UnauthorizedException();
    if (validToken.iat === parser.iat) {
      console.log(validToken, 'validToken');
      request.token = {
        userId: validToken.userId,
        deviceId: validToken.deviceId,
      };

      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
