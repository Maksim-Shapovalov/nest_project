import { DevicesUserDB, OutpatModeldevicesUser } from './Type/Device.user';
import { WithId } from 'mongodb';
import { DataIDModelClass } from './DataId.schemas';
import { injectable } from 'inversify';
import 'reflect-metadata';
@injectable()
export class SecurityDevicesRepopository {
  async getDevice(sessionId: string, id: string) {
    const device = await DataIDModelClass.findOne({ deviceId: sessionId });

    if (!device) {
      return null;
    }
    if (device?.userId !== id.toString()) {
      return 5;
    }
    return device;
  }

  async updateDevice(deviceId: string) {
    return DataIDModelClass.findOneAndUpdate(
      { deviceId: deviceId },
      { $set: { lastActiveDate: new Date().toISOString() } },
    );
  }

  async getAllDevices(
    userId: string,
  ): Promise<OutpatModeldevicesUser[] | null> {
    const devices = await DataIDModelClass.find({ userId: userId }).lean();
    if (!devices) {
      return null;
    }
    return devices.map(deviceMapper);
  }

  async deletingDevicesExceptId(userId: string, deviceId: string) {
    const deleted = await DataIDModelClass.deleteOne({ userId, deviceId });
    return deleted.deletedCount === 1;
  }

  async deletingAllDevices(user: string, device: string) {
    const deleted = await DataIDModelClass.deleteMany({
      userId: user,
      deviceId: { $ne: device },
    });
    return deleted.deletedCount > 1;
  }
}

const deviceMapper = (
  device: WithId<DevicesUserDB>,
): OutpatModeldevicesUser => {
  return {
    ip: device.ip,
    title: device.title,
    deviceId: device.deviceId,
    lastActiveDate: device.lastActiveDate,
  };
};
