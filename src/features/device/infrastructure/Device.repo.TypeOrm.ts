import { InjectRepository } from '@nestjs/typeorm';

import { DeviceClass, OutpatModelDevicesUser } from '../domain/Device.user';
import { setting } from '../../../setting';
import { JwtService } from '@nestjs/jwt';

import { Injectable } from '@nestjs/common';

import { DeviceEntity } from '../domain/Device.entity';
import { UserEntity } from '../../users/domain/User.entity';
import { Repository } from 'typeorm';
import { Device } from '../domain/Device.type';
@Injectable()
export class SecurityDevicesSQLTypeOrmRepository {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(DeviceEntity)
    protected deviceEntityRepository: Repository<DeviceEntity>,
    @InjectRepository(UserEntity)
    protected userEntityRepo: Repository<UserEntity>,
  ) {}

  async create(device: Device): Promise<boolean> {
    try {
      const newDevice = new DeviceEntity();
      newDevice.ip = device.getIp();
      newDevice.title = device.getTitle();
      newDevice.lastActiveDate = device.getLastActivateDate();
      newDevice.iat = device.getIat();
      newDevice.exp = device.getExp();
      newDevice.userId = device.getUserId();
      const createdDevice = await this.deviceEntityRepository.save(newDevice);

      return !!createdDevice;
      // const newDevice = await this.deviceEntityRepository.create({
      //   ip: device.getIp(),
      //   title: device.getTitle(),
      //   lastActiveDate: device.getLastActivateDate(),
      //   iat: device.getIat(),
      //   exp: device.getExp(),
      //   userId: device.getUserId(),
      // });
      // const createdDevice = await this.deviceEntityRepository.save(newDevice);
      //
      // return !!createdDevice;
    } catch (error) {
      return false;
    }
  }

  async getDevice(sessionId: string) {
    const device = await this.deviceEntityRepository.find({
      where: { deviceId: sessionId },
    });
    //"userId" = ${id} AND

    if (!device[0]) {
      return null;
    }
    return device;
  }
  async getDeviceByIdDeviceAndUSerID(deviceId: string, userId: string) {
    const user = await this.userEntityRepo.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    const findDeviceInDB = await this.deviceEntityRepository.findOne({
      where: { user: user, deviceId: deviceId },
    });
    if (!findDeviceInDB) return null;
    return findDeviceInDB[0];
  }
  async createDeviceAndSaveToDB(device: DeviceClass, userId: string) {
    const user = await this.userEntityRepo.findOne({
      where: { id: userId },
    });
    const newDevice = await this.deviceEntityRepository.create({
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate,
      user: user,
    });
    return this.deviceEntityRepository.save(newDevice);
  }
  async addDeviceInDB(token: DeviceEntity, refreshToken: string) {
    const parser = await this.jwtService.verify(refreshToken, {
      secret: setting.JWT_REFRESH_SECRET,
    });
    // const user = await this.userEntityRepo.findOne({
    //   where: { id: token.user.id },
    // });
    await this.deviceEntityRepository.update(token.deviceId, {
      iat: parser.iat,
      exp: parser.exp,
    });
    return true;
  }

  async updateDevice(deviceId: string) {
    const currencyDay = new Date().toISOString();
    return this.deviceEntityRepository.update(deviceId, {
      lastActiveDate: currencyDay,
    });
  }

  async getAllDevices(
    userId: string,
  ): Promise<OutpatModelDevicesUser[] | null> {
    const user = await this.userEntityRepo.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }

    const devices = await this.deviceEntityRepository.find({
      where: { user: user },
    });

    if (!devices || devices.length === 0) {
      return null;
    }

    return Promise.all(devices.map((device) => this.deviceMapper(device)));
  }

  async deletingDevicesExceptId(
    userId: string,
    deviceId: string,
  ): Promise<boolean | null> {
    const user = await this.userEntityRepo.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    const findDeviceInDB = await this.deviceEntityRepository.findOne({
      where: { user: user, deviceId: deviceId },
    });
    if (!findDeviceInDB) return null;
    await this.deviceEntityRepository.delete({
      user: user,
      deviceId: deviceId,
    });

    return true;
  }

  async deletingAllDevices(userId: string, deviceId: string): Promise<boolean> {
    await this.deviceEntityRepository
      .createQueryBuilder()
      .delete()
      .from(DeviceEntity)
      .where('user.id = :userId AND deviceId != :deviceId', {
        userId,
        deviceId,
      })
      .execute();

    return true;
  }

  async deletingAllDevicesByUserId(userId: string): Promise<boolean> {
    await this.deviceEntityRepository
      .createQueryBuilder()
      .delete()
      .from(DeviceEntity)
      .where('user.id = :userId', {
        userId,
      })
      .execute();

    return true;
  }
  async deviceMapper(device: DeviceEntity): Promise<OutpatModelDevicesUser> {
    return {
      ip: device.ip,
      title: device.title,
      deviceId: device.deviceId,
      lastActiveDate: device.lastActiveDate.toISOString(),
    };
  }
}
