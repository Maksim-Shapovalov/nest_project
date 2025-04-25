export class Device {
  private constructor(
    private readonly deviceId: string,
    private userId: string,
    private title: string,
    private lastActivateDate: Date,
    private ip: string,
    private iat: Date,
    private exp: Date,
  ) {}
  static create(
    userId: string,
    title: string,
    ip: string,
    iat: number,
    exp: number,
  ): Device {
    return new Device(
      '0',
      userId,
      title,
      new Date(),
      ip,
      new Date(iat * 1000),
      new Date(exp * 1000),
    );
  }

  static restore(
    id: string,
    userId: string,
    title: string,
    lastActivateDate: Date,
    ip: string,
    iat: Date,
    exp: Date,
  ): Device {
    return new Device(id, userId, title, lastActivateDate, ip, iat, exp);
  }

  getId(): string {
    return this.deviceId;
  }

  getUserId(): string {
    return this.userId;
  }

  getTitle(): string {
    return this.title;
  }

  getIp(): string {
    return this.ip;
  }

  getIat(): Date {
    return this.iat;
  }
  getLastActivateDate(): Date {
    return this.lastActivateDate;
  }

  getExp(): Date {
    return this.exp;
  }
}
