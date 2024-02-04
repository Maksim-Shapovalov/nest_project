import { injectable } from 'inversify';
import { SecurityDeviceService } from './SecurityDevice.service';
import { SecurityDevicesRepopository } from './SecurityDevices.repopository';
import { OutpatModeldevicesUser } from './Type/Device.user';
import 'reflect-metadata';
import { HTTP_STATUS } from '../Index';
import { Body, Controller, Delete, Get, Param } from '@nestjs/common';
import { WithId } from 'mongodb';
import { UserMongoDbType } from '../Users/Type/User.type';

@injectable()
@Controller()
export class DeviceController {
  constructor(
    protected securityDeviceService: SecurityDeviceService,
    protected securityDevicesRepo: SecurityDevicesRepopository,
  ) {}
  @Get()
  async getAllDevice(@Body() userFind: WithId<UserMongoDbType>) {
    const user = userFind;
    const devices: OutpatModeldevicesUser[] | null =
      await this.securityDeviceService.getAllDevices(user._id.toString());
    if (!devices) return HTTP_STATUS.NOT_FOUND_404;
    return devices;
  }
  @Delete('id')
  async deleteDeviceUserById(
    @Param('id') id: string,
    @Body() userFind: WithId<UserMongoDbType>,
  ) {
    const user = userFind;
    const findDevice: any = await this.securityDevicesRepo.getDevice(
      id,
      user._id.toString(),
    );

    if (!findDevice) return HTTP_STATUS.NOT_FOUND_404;
    if (findDevice === 5) return HTTP_STATUS.Forbidden_403;

    const deletedDevice =
      await this.securityDeviceService.deletingDevicesExceptId(
        user._id.toString(),
        id,
      );
    if (!deletedDevice) return HTTP_STATUS.NOT_FOUND_404;
    return HTTP_STATUS.NO_CONTENT_204;
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
    return HTTP_STATUS.NO_CONTENT_204;
  }
}
