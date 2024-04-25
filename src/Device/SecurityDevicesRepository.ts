import { DevicesUserDB, OutpatModelDevicesUser } from './Type/Device.user';
import { WithId } from 'mongodb';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocuments } from './Type/DataId.schemas';
import { Model } from 'mongoose';
@injectable()
export class SecurityDevicesRepository {
  constructor(
    @InjectModel(Device.name) protected deviceModel: Model<DeviceDocuments>,
  ) {}
  async getDevice(sessionId: string, id: string) {
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
    return deleted.deletedCount === 1;
  }

  async deletingAllDevices(user: string, device: string) {
    const deleted = await this.deviceModel.deleteMany({
      userId: user,
      deviceId: { $ne: device },
    });
    return deleted.deletedCount > 1;
  }
}

const deviceMapper = (
  device: WithId<DevicesUserDB>,
): OutpatModelDevicesUser => {
  return {
    ip: device.ip,
    title: device.title,
    deviceId: device.deviceId,
    lastActiveDate: device.lastActiveDate,
  };
};
