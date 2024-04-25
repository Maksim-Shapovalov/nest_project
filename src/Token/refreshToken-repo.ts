import { injectable } from 'inversify';
import 'reflect-metadata';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocuments } from './Token.schema';
import { Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import { PayloadTypeRefresh } from './refreshToken-type';

@injectable()
export class RefreshTokenRepo {
  constructor(
    @InjectModel(RefreshToken.name)
    protected tokenRefreshModel: Model<RefreshTokenDocuments>,
  ) {}
  async AddRefreshTokenInData(refreshToken: string) {
    const parser = jwt.decode(refreshToken) as PayloadTypeRefresh;
    await this.tokenRefreshModel.insertMany(parser);
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
  async DeleteRefreshTokenInData(refreshToken: string) {
    const parser = jwt.decode(refreshToken) as PayloadTypeRefresh;
    return this.tokenRefreshModel.findOneAndDelete({
      userId: parser.userId,
      deviceId: parser.deviceId,
      iat: parser.iat,
    });
  }
}
