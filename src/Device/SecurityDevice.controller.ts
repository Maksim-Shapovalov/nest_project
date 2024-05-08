import { injectable } from 'inversify';
import { SecurityDeviceService } from './SecurityDevice.service';
import { SecurityDevicesRepository } from './SecurityDevicesRepository';
import 'reflect-metadata';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OutpatModelDevicesUser } from './Type/Device.user';
import { CustomRequest, TokenRefreshGuard } from '../Token/token-guard';

@injectable()
@Controller('security/devices')
export class DeviceController {
  constructor(
    protected securityDeviceService: SecurityDeviceService,
    protected securityDevicesRepo: SecurityDevicesRepository,
  ) {}
  @UseGuards(TokenRefreshGuard)
  @Get()
  @HttpCode(200)
  async getAllDevice(@Req() request: CustomRequest) {
    const user = request.token.userId;
    const devices: OutpatModelDevicesUser[] | null =
      await this.securityDeviceService.getAllDevices(user);
    if (!devices) throw new NotFoundException();
    return devices;
  }
  @UseGuards(TokenRefreshGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteDeviceUserById(
    @Param('id') id: number,
    @Req() request: CustomRequest,
  ) {
    if (!id) throw new NotFoundException();
    const userId = request.token.userId;
    const findDevice: any = await this.securityDevicesRepo.getDevice(
      id,
      userId,
    );

    if (!findDevice) throw new NotFoundException();

    const deletedDevice =
      await this.securityDeviceService.deletingDevicesExceptId(userId, id);
    if (!deletedDevice) throw new ForbiddenException();
  }
  @UseGuards(TokenRefreshGuard)
  @Delete()
  @HttpCode(204)
  async deleteAllDeviceUserExceptCurrent(@Req() request: CustomRequest) {
    const { userId, deviceId } = request.token;
    await this.securityDeviceService.deletingAllDevices(userId, deviceId);
  }
}
