import { OutpatModelDevicesUser } from './Type/Device.user';
import { Injectable } from '@nestjs/common';
import { SecurityDevicesSQLTypeOrmRepository } from './TypeOrm/Device.repo.TypeOrm';

@Injectable()
export class SecurityDeviceService {
  constructor(
    protected securitySQLDevicesRepo: SecurityDevicesSQLTypeOrmRepository,
  ) {}
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
