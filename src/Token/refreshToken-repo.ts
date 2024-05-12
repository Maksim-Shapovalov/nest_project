import { injectable } from 'inversify';
import 'reflect-metadata';
import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocuments } from './Token.schema';
import { Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import { PayloadTypeRefresh } from './refreshToken-type';
import { setting } from '../setting';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@injectable()
export class RefreshTokenRepo {
  constructor(
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    protected tokenRefreshModel: Model<RefreshTokenDocuments>,
    @InjectDataSource() protected dataSource: DataSource,
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
    const parser = this.jwtService.decode(refreshToken) as PayloadTypeRefresh;
    return this.dataSource.query(
      `UPDATE "device" SET "iat" = ${parser.iat}, "exp" = ${parser.exp}  WHERE "userId" = ${parser.userId} and "deviceId" = ${parser.deviceId}`,
    );
    // return this.tokenRefreshModel.findOneAndUpdate(
    //   {
    //     userId: parser.userId,
    //     deviceId: parser.deviceId,
    //   },
    //   { $set: { iat: parser.iat, exp: parser.exp } },
    // );
  }
  async DeleteRefreshTokenInData(refreshToken: string): Promise<any> {
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
