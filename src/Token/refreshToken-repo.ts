import { DataIDModelClass } from '../Device/DataId.schemas';
import { DevicesUserDB } from '../Device/Type/Device.user';
import { injectable } from 'inversify';
import 'reflect-metadata';
@injectable()
export class RefreshTokenRepo {
  async AddRefreshTokenInData(token: DevicesUserDB) {
    await DataIDModelClass.insertMany(token);
    return true;
  }
}
