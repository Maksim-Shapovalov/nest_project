import { InjectRepository } from '@nestjs/typeorm';

import { DevicesUserDB, OutpatModelDevicesUser } from '../Type/Device.user';
import { setting } from '../../setting';
import { JwtService } from '@nestjs/jwt';

import { Injectable } from '@nestjs/common';

import { DeviceEntity } from '../Type/Device.entity';
import { UserEntity } from '../../Users/Type/User.entity';
import { Repository } from 'typeorm';
@Injectable()
export class SecurityDevicesSQLTypeOrmRepository {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(DeviceEntity)
    protected deviceEntityRepository: Repository<DeviceEntity>,
    @InjectRepository(UserEntity)
    protected userEntityRepo: Repository<UserEntity>,
  ) {}

  async getDevice(sessionId: number) {
    const device = await this.deviceEntityRepository.find({
      where: { deviceId: sessionId },
    });
    //"userId" = ${id} AND

    if (!device[0]) {
      return null;
    }
    return device;
  }
  async getDeviceByIdDeviceAndUSerID(deviceId: number, userId: number) {
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
  async addDeviceInDB(token: DevicesUserDB, refreshToken: string) {
    const parser = await this.jwtService.verify(refreshToken, {
      secret: setting.JWT_REFRESH_SECRET,
    });
    const user = await this.userEntityRepo.findOne({
      where: { id: +token.userId },
    });
    const newDevice = await this.deviceEntityRepository.create({
      deviceId: +token.deviceId,
      ip: token.ip,
      title: token.title,
      lastActiveDate: token.lastActiveDate,
      iat: parser.iat,
      exp: parser.exp,
      user: user,
    });
    await this.deviceEntityRepository.save(newDevice);
    return true;
  }

  async updateDevice(deviceId: number) {
    const currencyDay = new Date().toISOString();
    return this.deviceEntityRepository.update(deviceId, {
      lastActiveDate: currencyDay,
    });
  }

  async getAllDevices(
    userId: number,
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
    userId: number,
    deviceId: number,
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

  async deletingAllDevices(userId: number, deviceId: number): Promise<boolean> {
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
  async deviceMapper(device: DeviceEntity): Promise<OutpatModelDevicesUser> {
    return {
      ip: device.ip,
      title: device.title,
      deviceId: device.deviceId,
      lastActiveDate: device.lastActiveDate,
    };
  }
}
