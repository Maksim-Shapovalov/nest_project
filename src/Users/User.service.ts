import {
  UserBasicRequestBody,
  UserDbType,
  UserOutputModel,
  UserToShow,
} from './Type/User.type';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { addHours } from 'date-fns';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { userToPostMapper } from './postgres/User.SqlRepositories';
import { UserSQLTypeOrmRepository } from './TypeORM/User.repo.TypeORm';
@Injectable()
export class UserService {
  constructor(protected userSQLRepository: UserSQLTypeOrmRepository) {}
  async getNewUser(user: UserBasicRequestBody): Promise<UserToShow> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await this._generateHash(user.password, passwordSalt);

    const now = new Date();

    const newUser = new UserDbType(
      user.login,
      user.email,
      passwordHash,
      passwordSalt,
      now.toISOString(),
      {
        confirmationCode: randomUUID(),
        expirationDate: addHours(new Date(), 1).toISOString(),
        isConfirmed: false,
      },
      Math.floor(10000 + Math.random() * 90000).toString(),
    );
    const createdNewUser = await this.userSQLRepository.saveUser(newUser);
    return createdNewUser;
  }
  async deleteUserById(userId: string): Promise<boolean> {
    return await this.userSQLRepository.deleteUserById(userId);
  }
  async _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
  // async findOneUserByUserName(userName: string) {
  //   return this.userRepository.findByLoginOrEmail(userName);
  // }
  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserOutputModel | null> {
    const user = await this.userSQLRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) return null;

    const passwordHash = await this._generateHash(password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
