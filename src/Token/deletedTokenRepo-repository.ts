import { BlackListModel } from '../Other/blackList-schemas';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeletedTokenRepoRepository {
  constructor() {}
  async deletedTokens(token: any) {
    return BlackListModel.insertMany({ token });
  }

  async findRefreshTokenInDB(token: string) {
    const refreshToken = await BlackListModel.findOne({ token });
    if (!refreshToken) {
      return null;
    }
    return refreshToken.token;
  }
}
