import { Router } from 'express';
import { ValidationRefreshToken } from '../Token/token-middleware';
import { container } from '../composition-root/composition-root';
import { DeviceController } from './SecurityDevice.controller';

export const securityDevicesRouter = Router();

const deviceController = container.resolve<DeviceController>(DeviceController);

securityDevicesRouter.get(
  '/',
  ValidationRefreshToken,
  deviceController.getAllDevice.bind(deviceController),
);
securityDevicesRouter.delete(
  '/:idDevice',
  ValidationRefreshToken,
  deviceController.deleteDeviceUserById.bind(deviceController),
);
securityDevicesRouter.delete(
  '/',
  ValidationRefreshToken,
  deviceController.deleteAllDeviceUserExceptCurrent.bind(deviceController),
);
