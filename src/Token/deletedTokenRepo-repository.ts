import { BlackListModel } from '../Other/blackList-schemas';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class DeletedTokenRepoRepository {
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
