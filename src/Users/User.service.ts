import {
  UserBasicRequestBody,
  UserDbType,
  UserMongoDbType,
  UserToShow,
} from './Type/User.type';
import { UserRepository, userToPostMapper } from './User.repository';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { addHours } from 'date-fns';
@injectable()
export class UserService {
  constructor(protected userRepository: UserRepository) {}
  async getNewUser(user: UserBasicRequestBody): Promise<UserToShow> {
    console.log(1);
    const passwordSalt = await bcrypt.genSalt(10);
    console.log(2);
    const passwordHash = await this._generateHash(user.password, passwordSalt);
    console.log(passwordSalt, passwordHash);

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
    console.log(35);
    // add(now, {
    //   hours: 1,
    //   minutes: 3,
    // }).toString(),

    const result: UserMongoDbType = await this.userRepository.saveUser(newUser);
    return userToPostMapper(result);
  }
  async deleteUserById(userId: string): Promise<boolean> {
    return await this.userRepository.deleteUserById(userId);
  }
  async _generateHash(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }
  async checkCredentials(loginOrEmail: string, password: string) {
    const user = await this.userRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) return false;

    const passwordHash = await this._generateHash(password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) {
      return false;
    }
    return user;
  }
}
