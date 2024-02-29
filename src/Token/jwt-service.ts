import jwt from 'jsonwebtoken';
import { setting } from '../../src/setting';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenRepo } from './refreshToken-repo';
import { DeviceClass } from '../Device/Type/Device.user';
import { SecurityDevicesRepository } from '../Device/SecurityDevicesRepository';
import { UserToPostsOutputModel } from '../Users/Type/User.type';
import { injectable } from 'inversify';

type PayloadType = {
  userId: string;
  deviceId: string;
};
type PayloadTypeRefresh = {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
} | null;
@injectable()
export class JwtService {
  constructor(
    protected refreshTokenRepo: RefreshTokenRepo,
    protected securityDevicesRepo: SecurityDevicesRepository,
  ) {}

  async createdJWTAndInsertDevice(
    user: UserToPostsOutputModel,
    userAgent: any = null,
  ) {
    const createRefreshTokenMeta = new DeviceClass(
      userAgent.IP || '123',
      userAgent.deviceName || 'internet',
      new Date().toISOString(),
      uuidv4(),
      user.id,
    );

    await this.refreshTokenRepo.AddRefreshTokenInData(createRefreshTokenMeta);
    const accessToken: string = jwt.sign(
      { userId: user.id },
      setting.JWT_SECRET,
      { expiresIn: '5min' },
    );
    const refreshToken: string = jwt.sign(
      { userId: user.id, deviceId: createRefreshTokenMeta.deviceId },
      setting.JWT_REFRESH_SECRET,
      { expiresIn: '20000sec' },
    );

    return { accessToken, refreshToken };
  }

  async updateJWT(user: UserToPostsOutputModel, oldRefreshToken: string) {
    const parser = jwt.decode(oldRefreshToken) as PayloadTypeRefresh;
    if (!parser) {
      return null;
    }
    const createRefreshTokenMeta = {
      deviceId: parser.deviceId,
      userId: user.id,
    };
    await this.securityDevicesRepo.updateDevice(
      createRefreshTokenMeta.deviceId,
    );

    const accessToken: string = jwt.sign(
      { userId: user.id },
      setting.JWT_SECRET,
      { expiresIn: '5min' },
    );
    const refreshToken: string = jwt.sign(
      { userId: user.id, deviceId: createRefreshTokenMeta.deviceId },
      setting.JWT_REFRESH_SECRET,
      { expiresIn: '1000sec' },
    );
    return { accessToken, refreshToken };
  }

  async parseJWTRefreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, setting.JWT_REFRESH_SECRET);
      return payload as PayloadType;
    } catch (e) {
      return null;
    }
  }

  async getUserIdByToken(token: string) {
    try {
      const result: any = jwt.verify(token, setting.JWT_SECRET);
      return new ObjectId(result.userId);
    } catch (error) {
      return null;
    }
  }
}
