import { Column } from 'typeorm';
import { UserEntity } from '../../Users/Type/User.entity';

export class DeviceClass {
  constructor(
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    // public deviceId: string,
    public userId: string,
  ) {}
}

export type DevicesUserDB = {
  // id:string
  ip: string;
  title: string;
  lastActiveDate: string;
  userId: string;
};
export type OutpatModelDevicesUser = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};

export type DevicesType = {
  userId: number;
  deviceId: number;
  ip: string;
  title: string;
  lastActiveDate: string;
  iat: number;
  exp: number;
};
