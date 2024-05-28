import {
  PaginationType,
  UserPaginationQueryType,
} from '../qurey-repo/query-filter';
import {
  EmailConfirmations,
  FindUserByRecoveryCode,
  UserDbType,
  UserMongoDbType,
  UserOutputModel,
  UserToShow,
} from './Type/User.type';
import { ObjectId, WithId } from 'mongodb';
import add from 'date-fns/add';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocuments } from './Type/User.schemas';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

type possibleUser = {
  email: string;
  recoveryCode: string;
};
export type newDataUser2 = {
  newPassword: string;
  newSalt: string;
  recoveryCode: string;
};
@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) protected userModel: Model<UserDocuments>,
  ) {}
  async getAllUsers(
    filter: UserPaginationQueryType,
  ): Promise<PaginationType<UserToShow> | null> {
    const filterQuery = {
      $or: [
        { login: { $regex: filter.searchLoginTerm, $options: 'i' } },
        { email: { $regex: filter.searchEmailTerm, $options: 'i' } },
      ],
    };

    const pageSizeInQuery: number = filter.pageSize;
    const totalCountUsers = await this.userModel.countDocuments(filterQuery);

    const pageCountUsers: number = Math.ceil(totalCountUsers / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;
    const result = await this.userModel
      .find(filterQuery)
      .sort({ [filter.sortBy]: filter.sortDirection })
      .skip(pageBlog)
      .limit(pageSizeInQuery)
      .lean();
    const items = result.map((u) => userToPostMapper(u));
    return {
      pagesCount: pageCountUsers,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCountUsers,
      items: items,
    };
  }
  async getUserById(id: number): Promise<UserMongoDbType | null> {
    const user = await this.userModel.findOne({ _id: id }).lean();
    if (!user) return null;
    return user;
  }
  async getUserByIdWithMapper(id: string): Promise<UserOutputModel | null> {
    if (!ObjectId.isValid(id)) return null;
    const user = await this.userModel.findOne({ _id: new ObjectId(id) }).lean();
    if (user === null) return null;
    return userMapper(user);
  }
  async findUsersByCode(codeUser: string): Promise<FindUserByRecoveryCode> {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': codeUser,
    });
  }
  async getUserByCode(codeUser: string): Promise<boolean> {
    const res = await this.userModel.updateOne(
      { 'emailConfirmation.confirmationCode': codeUser },
      {
        $set: {
          'emailConfirmation.isConfirmed': true,
        },
      },
    );
    return res.matchedCount === 1;
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<FindUserByRecoveryCode> {
    const user = await this.userModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    if (!user) return null;
    return userToResendMessageMapper(user);
  }
  async findByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<FindUserByRecoveryCode> {
    const user = await this.userModel.findOne({
      $or: [{ login: login }, { email: email }],
    });
    if (!user) return null;
    return userToResendMessageMapper(user);
  }

  async findByEmailAndAddRecoveryode(possibleUser: possibleUser) {
    const findUser = await this.userModel.findOneAndUpdate(
      { email: possibleUser.email },
      { recoveryCode: possibleUser.recoveryCode },
    );
    if (!findUser) return false;
    return findUser;
  }
  async findUserByCodeInValidation(
    code: string | null,
  ): Promise<UserOutputModel | null> {
    const user = await this.userModel.findOne({ recoveryCode: code });
    if (!user) return null;
    return userMapper(user);
  }
  async findUserByRecoveryCode(newDataUser: newDataUser2) {
    const user = await this.userModel.findOneAndUpdate(
      { recoveryCode: newDataUser.recoveryCode },
      {
        passwordHash: newDataUser.newPassword,
        passwordSalt: newDataUser.newSalt,
      },
    );
    if (!user) return false;
    await this.userModel.findOneAndDelete(
      { recoveryCode: newDataUser.recoveryCode },
      { recoveryCode: newDataUser.recoveryCode },
    );
    return user;
  }

  async updateCodeToResendingMessage(userEmail: string, info: any) {
    await this.userModel.updateOne(
      { email: userEmail },
      {
        $set: {
          'emailConfirmation.confirmationCode': info.confirmationCode,
          'emailConfirmation.expirationDate': add(new Date(), {
            hours: 1,
            minutes: 3,
          }).toISOString(),
        },
      },
    );
    return this.userModel.findOne({ email: userEmail });
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const findUser = await this.userModel.deleteOne({
      _id: new ObjectId(userId),
    });
    return findUser.deletedCount === 1;
  }

  async saveUser(user: UserDbType): Promise<UserMongoDbType> {
    return this.userModel.create(user);
  }
}

export const userMapper = (user: WithId<UserMongoDbType>): UserOutputModel => {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    passwordHash: user.passwordHash,
    passwordSalt: user.passwordSalt,
    createdAt: user.createdAt,
  };
};
export const userToPostMapper = (user: WithId<UserMongoDbType>): UserToShow => {
  return {
    id: user._id.toHexString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
  };
};

export const userToResendMessageMapper = (
  user: WithId<UserMongoDbType>,
): FindUserByRecoveryCode => {
  return {
    id: user._id.toHexString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
    passwordHash: user.passwordHash,
    passwordSalt: user.passwordSalt,
    emailConfirmation: user.emailConfirmation,
    recoveryCode: user.recoveryCode,
  };
};
