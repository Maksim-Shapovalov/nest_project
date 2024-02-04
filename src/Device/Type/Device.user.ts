export class DeviceClass {
  constructor(
    public ip: string,
    public title: string,
    public lastActiveDate: string,
    public deviceId: string,
    public userId: string,
  ) {}
}

export type DevicesUserDB = {
  // id:string
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
  userId: string;
};
export type OutpatModeldevicesUser = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};
