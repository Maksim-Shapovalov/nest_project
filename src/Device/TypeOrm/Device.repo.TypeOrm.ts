import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DevicesUserDB, OutpatModelDevicesUser } from '../Type/Device.user';
import { setting } from '../../setting';
import { JwtService } from '@nestjs/jwt';
import { deviceMapper } from '../SecurityDevicesRepository';
import { Injectable } from '@nestjs/common';
@Injectable()
export class SecurityDevicesSQLTypeOrmRepository {
  constructor(
    private jwtService: JwtService,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async getDevice(sessionId: number) {
    const device = await this.dataSource.query(
      `SELECT * FROM "device_entity" WHERE "deviceId" = ${sessionId}`,
    );
    //"userId" = ${id} AND

    if (!device[0]) {
      return null;
    }
    return device;
  }
  async addDeviceInDB(token: DevicesUserDB, refreshToken: string) {
    console.log('repo device');
    const parser = await this.jwtService.verify(refreshToken, {
      secret: setting.JWT_REFRESH_SECRET,
    });
    console.log(token);
    console.log('123');
    console.log(`${token.deviceId},
     '${token.ip}',
      '${token.title}',
      '${token.lastActiveDate}',
       '${token.userId}',
        '${parser.iat}',
      '${parser.exp}`);
    await this.dataSource.query(`INSERT INTO public."device_entity"(
    "deviceId", ip, title, "lastActiveDate", "userId", iat, exp)
    VALUES (${token.deviceId}, '${token.ip}', '${token.title}',
     '${token.lastActiveDate}', ${token.userId}, ${parser.iat},
      ${parser.exp})
    RETURNING *
    `);
    console.log('321');
    return true;
  }
  async updateDevice(deviceId: number) {
    const currencyDay = new Date().toISOString();
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
      `SELECT * FROM "device_entity" WHERE "userId" = ${userId}`,
    );
    if (!devices) {
      return null;
    }
    return devices.map(deviceMapper);
  }

  async deletingDevicesExceptId(userId: number, deviceId: number) {
    const findDeviceInDB = await this.dataSource.query(
      `SELECT * FROM "device_entity" WHERE "userId" = ${userId} AND "deviceId" = ${deviceId}`,
    );
    if (!findDeviceInDB) return null;
    if (findDeviceInDB[0].userId !== userId) return null;
    await this.dataSource.query(
      `DELETE FROM public."device_entity" WHERE "userId" = ${userId} AND "deviceId" = ${deviceId}`,
    );

    return true;
  }

  async deletingAllDevices(userId: number, deviceId: number) {
    await this.dataSource.query(
      `DELETE FROM public."device_entity" WHERE  "userId" = ${userId} AND NOT "deviceId" = ${deviceId}`,
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
