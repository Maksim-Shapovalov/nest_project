import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshTokenRepo } from './refreshToken-repo';
import jwt from 'jsonwebtoken';
import { PayloadTypeRefresh } from './refreshToken-type';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocuments } from './Token.schema';
import { Model } from 'mongoose';

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
    @InjectModel(RefreshToken.name)
    protected tokenRefreshModel: Model<RefreshTokenDocuments>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as CustomRequest;
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) throw new UnauthorizedException();
    const parser = jwt.decode(refreshToken) as PayloadTypeRefresh;
    const validToken = await this.tokenRefreshModel.findOne({
      userId: parser.userId,
      deviceId: parser.deviceId,
      iat: parser.iat,
    });
    console.log(validToken, 'validToken');
    if (!validToken) throw new UnauthorizedException();
    request.token = {
      userId: validToken.userId,
      deviceId: validToken.deviceId,
    };

    return true;
  }
}
