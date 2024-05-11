import { DevicesUserDB, OutpatModelDevicesUser } from './Type/Device.user';
import { WithId } from 'mongodb';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocuments } from './Type/DataId.schemas';
import { Model } from 'mongoose';
import { RefreshToken, RefreshTokenDocuments } from '../Token/Token.schema';
@injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(Device.name) protected deviceModel: Model<DeviceDocuments>,
    @InjectModel(RefreshToken.name)
    protected tokenRefreshModel: Model<RefreshTokenDocuments>,
  ) {}
  async getDevice(sessionId: number, id: number) {
    const device = await this.deviceModel.findOne({ deviceId: sessionId });

    if (!device) {
      return null;
    }
    if (device?.userId !== id.toString()) {
      return 5;
    }
    return device;
  }
  async addDeviceInDB(token: DevicesUserDB) {
    return this.deviceModel.insertMany(token);
  }

  async updateDevice(deviceId: string) {
    return this.deviceModel.findOneAndUpdate(
      { deviceId: deviceId },
      { $set: { lastActiveDate: new Date().toISOString() } },
    );
  }

  async getAllDevices(
    userId: string,
  ): Promise<OutpatModelDevicesUser[] | null> {
    const devices = await this.deviceModel.find({ userId: userId }).lean();
    if (!devices) {
      return null;
    }
    return devices.map(deviceMapper);
  }

  async deletingDevicesExceptId(userId: string, deviceId: string) {
    const deleted = await this.deviceModel.deleteOne({ userId, deviceId });
    await this.tokenRefreshModel.deleteOne({ userId, deviceId });
    return deleted.deletedCount === 1;
  }

  async deletingAllDevices(user: number, device: number) {
    const deleted = await this.deviceModel.deleteMany({
      userId: user,
      deviceId: { $ne: device },
    });
    await this.tokenRefreshModel.deleteMany({
      userId: user,
      deviceId: { $ne: device },
    });
    return deleted.deletedCount > 1;
  }
}

export const deviceMapper = (
  device: WithId<DevicesUserDB>,
): OutpatModelDevicesUser => {
  return {
    ip: device.ip,
    title: device.title,
    deviceId: device.deviceId.toString(),
    lastActiveDate: device.lastActiveDate,
  };
};
