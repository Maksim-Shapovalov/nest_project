import { injectable } from 'inversify';
import { SecurityDeviceService } from './SecurityDevice.service';
import { SecurityDevicesRepository } from './SecurityDevicesRepository';
import { OutpatModeldevicesUser } from './Type/Device.user';
import 'reflect-metadata';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { WithId } from 'mongodb';
import { UserMongoDbType } from '../Users/Type/User.type';

@injectable()
@Controller('devices')
export class DeviceController {
  constructor(
    protected securityDeviceService: SecurityDeviceService,
    protected securityDevicesRepo: SecurityDevicesRepository,
  ) {}
  @Get()
  @HttpCode(200)
  async getAllDevice(@Body() userFind: WithId<UserMongoDbType>) {
    const user = userFind;
    const devices: OutpatModeldevicesUser[] | null =
      await this.securityDeviceService.getAllDevices(user._id.toString());
    if (!devices) throw new NotFoundException();
    return devices;
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteDeviceUserById(
    @Param('id') id: string,
    @Body() userFind: WithId<UserMongoDbType>,
  ) {
    const user = userFind;
    const findDevice: any = await this.securityDevicesRepo.getDevice(
      id,
      user._id.toString(),
    );

    if (!findDevice) return HttpCode(404);
    if (findDevice === 5) return HttpCode(403);

    const deletedDevice =
      await this.securityDeviceService.deletingDevicesExceptId(
        user._id.toString(),
        id,
      );
    if (!deletedDevice) throw new NotFoundException();
    return HttpCode(204);
  }
  @Delete()
  async deleteAllDeviceUserExceptCurrent(
    @Body() userFind: WithId<UserMongoDbType>,
    @Body() deviceIdInBody: string,
  ) {
    await this.securityDeviceService.deletingAllDevices(
      userFind._id.toString(),
      deviceIdInBody,
    );
    return HttpCode(204);
  }
}
