import { SecurityDeviceService } from '../aplication/SecurityDevice.service';

import {
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
import { OutpatModelDevicesUser } from '../domain/Device.user';
import {
  CustomRequest,
  TokenRefreshGuard,
} from '../../../core/guard/token-guard';
import { SecurityDevicesSQLTypeOrmRepository } from '../infrastructure/Device.repo.TypeOrm';

@Controller('security/devices')
export class DeviceController {
  constructor(
    protected securityDeviceService: SecurityDeviceService,
    protected securitySQLDevicesRepo: SecurityDevicesSQLTypeOrmRepository,
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
    @Param('id') id: string,
    @Req() request: CustomRequest,
  ) {
    if (!id) throw new NotFoundException();
    const userId = request.token.userId;
    const findDevice: any = await this.securitySQLDevicesRepo.getDevice(id);
    if (!findDevice) throw new NotFoundException();
    if (findDevice[0].deviceId !== id || findDevice[0].userId !== userId)
      throw new ForbiddenException();

    const deletedDevice =
      await this.securityDeviceService.deletingDevicesExceptId(userId, id);
    if (!deletedDevice) throw new ForbiddenException();
  }
  @UseGuards(TokenRefreshGuard)
  @Delete()
  @HttpCode(204)
  async deleteAllDeviceUserExceptCurrent(@Req() request: CustomRequest) {
    const { userId, deviceId } = request.token;
    const deletedDevice = await this.securityDeviceService.deletingAllDevices(
      userId,
      deviceId,
    );
    if (!deletedDevice) throw new ForbiddenException();
  }
}
