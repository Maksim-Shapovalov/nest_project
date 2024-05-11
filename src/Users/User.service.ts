import {
  UserBasicRequestBody,
  UserDbType,
  UserOutputModel,
  UserToShow,
} from './Type/User.type';
import { UserRepository } from './User.repository';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { addHours } from 'date-fns';
import { UnauthorizedException } from '@nestjs/common';
import { UserSQLRepository, userToPostMapper } from './User.SqlRepositories';
@injectable()
export class UserService {
  constructor(
    protected userRepository: UserRepository,
    protected userSQLRepository: UserSQLRepository,
  ) {}
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
    return userToPostMapper(createdNewUser[0]);
  }
  async deleteUserById(userId: number): Promise<boolean> {
    return await this.userSQLRepository.deleteUserById(userId);
  }
  async _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
  async findOneUserByUserName(userName: string) {
    return this.userRepository.findByLoginOrEmail(userName);
  }
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
