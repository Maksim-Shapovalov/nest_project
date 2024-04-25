import { injectable } from 'inversify';
import 'reflect-metadata';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocuments } from './Token.schema';
import { Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import { PayloadTypeRefresh } from './refreshToken-type';
import { setting } from '../setting';
import { JwtService } from '@nestjs/jwt';

@injectable()
export class RefreshTokenRepo {
  constructor(
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    protected tokenRefreshModel: Model<RefreshTokenDocuments>,
  ) {}
  async AddRefreshTokenInData(refreshToken: string) {
    const parser = await this.jwtService.verify(refreshToken, {
      secret: setting.JWT_REFRESH_SECRET,
    });
    await this.tokenRefreshModel.create(parser);
    return true;
  }
  // async FindRefreshTokenInData(refreshToken: string) {
  //   const parser = jwt.decode(refreshToken) as PayloadTypeRefresh;
  //   return this.tokenRefreshModel.findOne({
  //     userId: parser.userId,
  //     deviceId: parser.deviceId,
  //     iat: parser.iat,
  //   });
  // }
  async UpdateRefreshTokenInData(refreshToken: string) {
    const parser = jwt.decode(refreshToken) as PayloadTypeRefresh;
    return this.tokenRefreshModel.findOneAndUpdate({
      userId: parser.userId,
      deviceId: parser.deviceId,
      iat: parser.iat,
    });
  }
  async DeleteRefreshTokenInData(refreshToken: string) {
    const parser = await this.jwtService.verify(refreshToken, {
      secret: setting.JWT_REFRESH_SECRET,
    });

    return this.tokenRefreshModel.deleteOne({
      userId: parser.userId,
      deviceId: parser.deviceId,
      iat: parser.iat,
    });
  }
}
