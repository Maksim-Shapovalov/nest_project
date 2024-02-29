import { DevicesUserDB } from '../Device/Type/Device.user';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { InjectModel } from '@nestjs/mongoose';
import { Token, TokenDocuments } from './Token.schema';
import { Model } from 'mongoose';
@injectable()
export class RefreshTokenRepo {
  constructor(
    @InjectModel(Token.name) protected tokenModel: Model<TokenDocuments>,
  ) {}
  async AddRefreshTokenInData(token: DevicesUserDB) {
    await this.tokenModel.insertMany(token);
    return true;
  }
}
