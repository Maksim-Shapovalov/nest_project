export class DeviceClass {
  constructor(
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public userId: string,
  ) {}
}

export type OutpatModelDevicesUser = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};
