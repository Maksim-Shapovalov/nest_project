import { injectable } from 'inversify';
import { SecurityDeviceService } from './SecurityDevice.service';
import { SecurityDevicesRepository } from './SecurityDevicesRepository';
import 'reflect-metadata';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NewestPostLike } from '../Users/Type/User.type';
import { OutpatModelDevicesUser } from './Type/Device.user';
import { HTTP_STATUS } from '../app.module';
import { BearerGuard } from '../auth/guard/authGuard';

@injectable()
@Controller('devices')
export class DeviceController {
  constructor(
    protected securityDeviceService: SecurityDeviceService,
    protected securityDevicesRepo: SecurityDevicesRepository,
  ) {}
  @UseGuards(BearerGuard)
  @Get()
  @HttpCode(HTTP_STATUS.OK_200)
  async getAllDevice(@Req() request) {
    const user = request.user as NewestPostLike;
    const devices: OutpatModelDevicesUser[] | null =
      await this.securityDeviceService.getAllDevices(user.userId);
    if (!devices) throw new NotFoundException();
    return devices;
  }
  @UseGuards(BearerGuard)
  @Delete(':id')
  @HttpCode(HTTP_STATUS.NO_CONTENT_204)
  async deleteDeviceUserById(@Param('id') id: string, @Req() request) {
    const user = request.user as NewestPostLike;
    const findDevice: any = await this.securityDevicesRepo.getDevice(
      id,
      user.userId,
    );

    if (!findDevice) return HttpCode(404);
    if (findDevice === 5) return HttpCode(403);

    const deletedDevice =
      await this.securityDeviceService.deletingDevicesExceptId(user.userId, id);
    if (!deletedDevice) throw new NotFoundException();
  }
  @UseGuards(BearerGuard)
  @Delete()
  @HttpCode(HTTP_STATUS.NO_CONTENT_204)
  async deleteAllDeviceUserExceptCurrent(
    @Req() request,
    @Body() deviceIdInBody: string,
  ) {
    const user = request.user as NewestPostLike;
    await this.securityDeviceService.deletingAllDevices(
      user.userId,
      deviceIdInBody,
    );
  }
}
