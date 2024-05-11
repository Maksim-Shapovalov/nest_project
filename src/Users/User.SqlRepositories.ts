import {
  PaginationType,
  UserPaginationQueryType,
} from '../qurey-repo/query-filter';

import { injectable } from 'inversify';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  EmailConfirmations,
  FindUserByRecoveryCode,
  UserDbType,
  UserMongoDbType,
  UserOutputModel,
  UserToShow,
} from './Type/User.type';
import add from 'date-fns/add';

type possibleUser = {
  email: string;
  recoveryCode: string;
};
export type newDataUser2 = {
  newPassword: string;
  newSalt: string;
  recoveryCode: string;
};
@injectable()
export class UserSQLRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getAllUsers(
    filter: UserPaginationQueryType,
  ): Promise<PaginationType<UserToShow> | null> {
    const searchLoginTerm = filter.searchLoginTerm;
    const searchEmailTerm = filter.searchEmailTerm;
    const logOrEm = searchLoginTerm
      ? `WHERE login LIKE '${searchLoginTerm}'`
      : searchEmailTerm
        ? `WHERE email LIKE '${searchEmailTerm}'`
        : '';

    const pageSizeInQuery: number = filter.pageSize;
    const totalCountUsersQuery = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Users" ${logOrEm}`,
    );
    console.log(totalCountUsersQuery, totalCountUsersQuery[0].count);
    const totalCount = parseInt(totalCountUsersQuery[0].count);
    const pageCountUsers: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageOffset: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.dataSource.query(
      `SELECT * FROM "Users" ${logOrEm} ORDER BY "${filter.sortBy || 'createdAt'}" LIMIT ${pageSizeInQuery} OFFSET ${pageOffset}`,
    );

    const items = result.map((u) => userToPostMapper(u));
    console.log(items);

    return {
      pagesCount: pageCountUsers,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCount,
      items: items[0],
    };
  }
  async getUserById(id: number): Promise<UserMongoDbType | null> {
    const getUserQuery = 'SELECT * FROM "Users" WHERE id = $1';
    const getUserValues = [id];
    const result = await this.dataSource
      .query(getUserQuery, getUserValues)
      .then((result) => result.rows);

    if (result.length === 0) {
      return null;
    }

    const user = result[0];

    return user;
  }
  async getUserByIdWithMapper(id: string): Promise<UserOutputModel | null> {
    const getUserQuery = 'SELECT * FROM "Users" WHERE id = $1';
    const getUserValues = [id];
    const result = await this.dataSource
      .query(getUserQuery, getUserValues)
      .then((result) => result.rows);

    if (result.length === 0) {
      return null;
    }

    const user = result[0];
    const mappedUser = userMapper(user);

    return mappedUser;
  }
  async findUsersByCode(codeUser: string): Promise<FindUserByRecoveryCode> {
    const getUsersQuery = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE "email_confirmation_confirmation_code" = ''${codeUser}`,
    );
    if (getUsersQuery.length === 0) {
      return null;
    }

    const user = getUsersQuery[0];

    return user;
  }
  async getUserByCode(codeUser: string): Promise<boolean> {
    const updateUserQuery =
      'UPDATE "Users" SET email_confirmation_is_confirmed = true WHERE email_confirmation_confirmation_code = $1';
    const updateUserValues = [codeUser];
    const result = await this.dataSource.query(
      updateUserQuery,
      updateUserValues,
    );

    return result.rowCount === 1;
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<FindUserByRecoveryCode> {
    const findUserQuery = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE login = '${loginOrEmail}' OR email = '${loginOrEmail}'`,
    );

    if (findUserQuery.length === 0) {
      return null;
    }

    const user = findUserQuery[0];
    const mappedUser = userToResendMessageMapper(user);

    return mappedUser;
  }
  async findByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<FindUserByRecoveryCode> {
    const findUserQuery = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE login = '${login}' AND email = '${email}'`,
    );

    if (findUserQuery.length === 0) {
      return null;
    }

    const user = findUserQuery[0];
    const mappedUser = userToResendMessageMapper(user);

    return mappedUser;
  }

  async findByEmailAndAddRecoveryCode(possibleUser: possibleUser) {
    const updateUserQuery = await this.dataSource.query(
      `UPDATE "Users" SET recovery_code = ${possibleUser.recoveryCode} WHERE email = ${possibleUser.email}`,
    );

    if (!updateUserQuery) return false;

    return true;
  }
  async findUserByCodeInValidation(
    code: string | null,
  ): Promise<UserOutputModel | null> {
    const findUserQuery = 'SELECT * FROM "Users" WHERE recovery_code = $1';
    const findUserValues = [code];
    const result = await this.dataSource
      .query(findUserQuery, findUserValues)
      .then((result) => result.rows);

    if (result.length === 0) {
      return null;
    }

    const user = result[0];
    const mappedUser = userMapper(user);

    return mappedUser;
  }

  async findUserByRecoveryCode(newDataUser: newDataUser2) {
    const findUserQuery = await this.dataSource.query(
      `UPDATE "Users" SET "password_hash" = '${newDataUser.newPassword}', "password_salt" = '${newDataUser.newSalt}' WHERE "recovery_code" = '${newDataUser.recoveryCode}' RETURNING *`,
    );

    if (findUserQuery.length === 0) {
      return false;
    }

    const user = findUserQuery[0];

    // const deleteUserQuery = 'DELETE FROM "Users" WHERE "recovery_code" = ${}';
    // const deleteUserValues = [newDataUser.recoveryCode];
    // await this.dataSource.query(deleteUserQuery, deleteUserValues);

    return user;
  }

  async updateCodeToResendingMessage(userEmail: string, info: any) {
    const updateCodeQuery = `
    UPDATE "Users"
    SET email_confirmation_confirmation_code = $1, email_confirmation_expiration_date = $2
    WHERE email = $3
    RETURNING *
  `;
    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    }).toISOString();
    const updateCodeValues = [info.confirmationCode, expirationDate, userEmail];
    await this.dataSource.query(updateCodeQuery, updateCodeValues);

    const findUserQuery = 'SELECT * FROM "Users" WHERE email = $1';
    const findUserValues = [userEmail];
    const result = await this.dataSource
      .query(findUserQuery, findUserValues)
      .then((result) => result.rows);

    if (result.length === 0) {
      return null;
    }

    const user = result[0];
    return user;
  }

  // async deleteUserById(userId: number): Promise<boolean> {
  //   const deleteUserQuery = await this.dataSource.query(
  //     'DELETE FROM public."Users" WHERE "id" = $1;',
  //     [userId],
  //   );
  //
  //   return deleteUserQuery.rowCount === 1;
  // }
  async deleteUserById(userId: number): Promise<boolean> {
    const findUserInDB = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE "id" = ${userId}`,
    );
    if (!findUserInDB) return false;
    await this.dataSource.query(
      `DELETE FROM public."Users" WHERE "id" = ${userId} ;`,
    );
    return true;
  }
  //: Promise<UserMongoDbType>
  async saveUser(user: UserDbType): Promise<UserToShow> {
    const randomId = Math.floor(Math.random() * 1000000);
    const saveUserQuery = `
    INSERT INTO public."Users"(
    id, login, email, "passwordHash", "passwordSalt", "createdAt", "confirmationCode",
     "expirationDate", "isConfirmed", "recoveryCode")
    VALUES (${randomId},
    '${user.login}','${user.email}','${user.passwordHash}',
    '${user.passwordSalt}','${user.createdAt}',
    '${user.emailConfirmation.confirmationCode}',
    '${user.emailConfirmation.expirationDate}',
    '${user.emailConfirmation.isConfirmed}','${user.recoveryCode}')
    RETURNING *
  `;
    const result = await this.dataSource.query(saveUserQuery);
    console.log(result);
    const newUser = result.map((e) => {
      return {
        id: e.id,
        login: e.login,
        email: e.email,
        createdAt: e.createdAt,
      };
    });
    console.log(newUser, 'newUser');
    return newUser;
  }
}

export const userMapper = (user: any): UserOutputModel => {
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    passwordHash: user.passwordHash,
    passwordSalt: user.passwordSalt,
    createdAt: user.createdAt,
  };
};

export const userToPostMapper = (user: any): UserToShow => {
  return {
    id: user.id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
  };
};

export const userToResendMessageMapper = (
  user: any,
): FindUserByRecoveryCode => {
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
    passwordHash: user.passwordHash,
    passwordSalt: user.passwordSalt,
    emailConfirmation: user.emailConfirmation,
    recoveryCode: user.recoveryCode,
  };
};
