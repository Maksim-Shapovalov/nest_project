import { OutpatModelDevicesUser } from '../domain/Device.user';
import { Injectable } from '@nestjs/common';
import { SecurityDevicesSQLTypeOrmRepository } from '../infrastructure/Device.repo.TypeOrm';

@Injectable()
export class SecurityDeviceService {
  constructor(
    protected securitySQLDevicesRepo: SecurityDevicesSQLTypeOrmRepository,
  ) {}
  async getAllDevices(
    userId: string,
  ): Promise<OutpatModelDevicesUser[] | null> {
    const devices = await this.securitySQLDevicesRepo.getAllDevices(userId);
    if (!devices) {
      return null;
    }
    return devices;
  }

  async deletingDevicesExceptId(userId: string, deviceId: string) {
    return this.securitySQLDevicesRepo.deletingDevicesExceptId(
      userId,
      deviceId,
    );
  }

  async deletingAllDevices(user: string, device: string) {
    return this.securitySQLDevicesRepo.deletingAllDevices(user, device);
  }
}
