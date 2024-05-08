import { SecurityDevicesRepository } from './SecurityDevicesRepository';
import { ObjectId } from 'mongodb';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { OutpatModelDevicesUser } from './Type/Device.user';
import { SecurityDevicesSQLRepository } from './postgres/SecurityDeviceSQLRepository';

@injectable()
export class SecurityDeviceService {
  constructor(
    protected securityDevicesRepo: SecurityDevicesRepository,
    protected securitySQLDevicesRepo: SecurityDevicesSQLRepository,
  ) {}
  async getAllDevices(
    userId: string,
  ): Promise<OutpatModelDevicesUser[] | null> {
    const devices = await this.securityDevicesRepo.getAllDevices(
      new ObjectId(userId).toString(),
    );
    if (!devices) {
      return null;
    }
    return devices;
  }

  async deletingDevicesExceptId(userId: number, deviceId: number) {
    return this.securitySQLDevicesRepo.deletingDevicesExceptId(
      userId,
      deviceId,
    );
  }

  async deletingAllDevices(user: string, device: string) {
    return this.securityDevicesRepo.deletingAllDevices(user, device);
  }
}
