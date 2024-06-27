import { InjectModel } from '@nestjs/mongoose';
import { RefreshToken, RefreshTokenDocuments } from './Token.schema';
import { Model } from 'mongoose';
import { PayloadTypeRefresh } from './refreshToken-type';
import { setting } from '../setting';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
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
  async UpdateRefreshTokenInData(refreshToken: string) {
    const parser = this.jwtService.decode(refreshToken) as PayloadTypeRefresh;
    return this.dataSource.query(
      `UPDATE "device_entity" SET "iat" = ${parser.iat}, "exp" = ${parser.exp}  WHERE "userId" = ${parser.userId} and "deviceId" = ${parser.deviceId}`,
    );
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
