import { injectable } from 'inversify';
import 'reflect-metadata';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DevicesUserDB, OutpatModelDevicesUser } from '../Type/Device.user';
import { setting } from '../../setting';
import { JwtService } from '@nestjs/jwt';
import { deviceMapper } from '../SecurityDevicesRepository';
@injectable()
export class SecurityDevicesSQLRepository {
  constructor(
    private jwtService: JwtService,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async getDevice(sessionId: number, id: number) {
    const device = await this.dataSource.query(
      `SELECT * FROM "device" WHERE "userId" = ${id} AND "deviceId" = ${sessionId}`,
    );

    if (!device[0]) {
      return null;
    }
    return device;
  }
  async addDeviceInDB(token: DevicesUserDB, refreshToken: string) {
    const parser = await this.jwtService.verify(refreshToken, {
      secret: setting.JWT_REFRESH_SECRET,
    });
    await this.dataSource.query(`INSERT INTO public.device(
    "deviceId", ip, title, "lastActiveDate", "userId", iat, exp)
    VALUES ('${token.deviceId}', '${token.ip}', '${token.title}',
     '${token.lastActiveDate}', '${token.userId}', '${parser.iat}',
      '${parser.exp}')
    RETURNING *
    `);
    return true;
  }
  async updateDevice(deviceId: number) {
    const currencyDay = new Date().toISOString();
    console.log(currencyDay);
    const updateDevice = await this.dataSource.query(
      `UPDATE public.device
    SET "lastActiveDate"= '${currencyDay}'
    WHERE "deviceId" = ${deviceId};`,
    );
    return updateDevice;
  }

  async getAllDevices(
    userId: number,
  ): Promise<OutpatModelDevicesUser[] | null> {
    const devices = await this.dataSource.query(
      `SELECT * FROM "device" WHERE "userId" = ${userId}`,
    );
    if (!devices) {
      return null;
    }
    return devices.map(deviceMapper);
  }

  async deletingDevicesExceptId(userId: number, deviceId: number) {
    const findDeviceInDB = await this.dataSource.query(
      `SELECT * FROM "device" WHERE "userId" = ${userId} AND "deviceId" = ${deviceId}`,
    );
    if (!findDeviceInDB) return null;
    await this.dataSource.query(
      `DELETE FROM public."device" WHERE "userId" = ${userId} AND "deviceId" = ${deviceId}`,
    );

    return true;
  }

  async deletingAllDevices(userId: number, deviceId: number) {
    await this.dataSource.query(
      `DELETE FROM public."device" WHERE  "userId" = ${userId} AND NOT "deviceId" = ${deviceId}`,
    );
    return true;
  }
}

// const deviceMapper = (
//   device: WithId<DevicesUserDB>,
// ): OutpatModelDevicesUser => {
//   return {
//     ip: device.ip,
//     title: device.title,
//     deviceId: device.deviceId,
//     lastActiveDate: device.lastActiveDate,
//   };
// };
