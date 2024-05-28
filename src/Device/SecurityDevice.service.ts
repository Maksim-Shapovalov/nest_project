import { OutpatModelDevicesUser } from './Type/Device.user';
import { SecurityDevicesSQLRepository } from './postgres/SecurityDeviceSQLRepository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityDeviceService {
  constructor(protected securitySQLDevicesRepo: SecurityDevicesSQLRepository) {}
  async getAllDevices(
    userId: number,
  ): Promise<OutpatModelDevicesUser[] | null> {
    const devices = await this.securitySQLDevicesRepo.getAllDevices(userId);
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

  async deletingAllDevices(user: number, device: number) {
    return this.securitySQLDevicesRepo.deletingAllDevices(user, device);
  }
}
