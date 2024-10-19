import {
  PaginationType,
  UserPaginationQueryType,
} from '../../qurey-repo/query-filter';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindUserByRecoveryCode,
  UserDbType,
  UserOutputModel,
  UserToShow,
} from '../Type/User.type';
import add from 'date-fns/add';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../Type/User.entity';

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
export class UserSQLTypeOrmRepository {
  constructor(
    @InjectRepository(UserEntity)
    protected userEntityRepo: Repository<UserEntity>,
  ) {}
  async getAllUsers(
    filter: UserPaginationQueryType,
  ): Promise<PaginationType<UserToShow> | null> {
    const searchLoginTerm = filter.searchLoginTerm;
    const searchEmailTerm = filter.searchEmailTerm;
    const pageSizeInQuery: number = filter.pageSize;
    const sortDirection =
      filter.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const totalCountUsersQuery = await this.userEntityRepo
      .createQueryBuilder('user')
      .select('COUNT(*)', 'count')
      .where('LOWER(user.login) LIKE LOWER(:login)', {
        login: `%${searchLoginTerm}%`,
      })
      .orWhere('LOWER(user.email) LIKE LOWER(:email)', {
        email: `%${searchEmailTerm}%`,
      })
      .getRawOne();
    const totalCount = parseInt(totalCountUsersQuery.count);
    const pageCountUsers: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageOffset: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.userEntityRepo
      .createQueryBuilder('user')
      .where('LOWER(user.login) LIKE LOWER(:login)', {
        login: `%${searchLoginTerm}%`,
      })
      .orWhere('LOWER(user.email) LIKE LOWER(:email)', {
        email: `%${searchEmailTerm}%`,
      })
      .orderBy(`user.${filter.sortBy}`, sortDirection)
      .take(pageSizeInQuery)
      .skip(pageOffset)
      .getMany();
    // this.dataSource.query(
    //   `SELECT * FROM "user_entity" WHERE LOWER("login") LIKE LOWER('%${searchLoginTerm}%') OR LOWER("email") LIKE LOWER('%${searchEmailTerm}%') ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT ${pageSizeInQuery} OFFSET ${pageOffset}`,
    // );

    const items = result.map((u) => userToPostMapper(u));

    return {
      pagesCount: pageCountUsers,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCount,
      items: items,
    };
  }
  async getUserById(id: number): Promise<FindUserByRecoveryCode | null> {
    const getUserQuery = await this.userEntityRepo.find({ where: { id: id } });
    // await this.dataSource.query(`SELECT * FROM "user_entity" WHERE id = ${id}`);
    if (getUserQuery.length === 0) {
      return null;
    }
    return userToResendMessageMapper(getUserQuery[0]);
  }
  // async getUserByIdWithMapper(id: string): Promise<UserOutputModel | null> {
  //   const getUserQuery = 'SELECT * FROM "user_entity" WHERE id = $1';
  //   const getUserValues = [id];
  //   const result = await this.dataSource
  //     .query(getUserQuery, getUserValues)
  //     .then((result) => result.rows);
  //
  //   if (result.length === 0) {
  //     return null;
  //   }
  //
  //   const user = result[0];
  //   return userMapper(user);
  // }
  async findUsersByCode(codeUser: string): Promise<FindUserByRecoveryCode> {
    const getUsersQuery = await this.userEntityRepo.find({
      where: { confirmationCode: codeUser },
    });
    // await this.dataSource.query(
    //   `SELECT * FROM "user_entity" WHERE "confirmationCode" = '${codeUser}'`,
    // );
    if (getUsersQuery.length === 0) {
      return null;
    }
    const user = getUsersQuery[0];

    return userToResendMessageMapper(user);
  }
  async getUserByCode(codeUser: string): Promise<boolean> {
    await this.userEntityRepo.update(codeUser, {
      isConfirmed: true,
    });
    // await this.dataSource.query(`
    //   UPDATE "user_entity" SET "isConfirmed" = true WHERE "confirmationCode" = '${codeUser}'`);

    return true;
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<FindUserByRecoveryCode> {
    const findUserQuery = await this.userEntityRepo.find({
      where: [{ login: loginOrEmail, email: loginOrEmail }],
    });
    // await this.dataSource.query(
    //   `SELECT * FROM "user_entity" WHERE "login" = '${loginOrEmail}' OR "email" = '${loginOrEmail}'`,
    // );

    if (findUserQuery.length === 0) {
      return null;
    }

    const user = findUserQuery[0];
    return userToResendMessageMapper(user);
  }
  async findByLoginOrEmailByOneUser(
    login: string,
    email: string,
  ): Promise<FindUserByRecoveryCode> {
    const findUserQuery = await this.userEntityRepo.find({
      where: [{ login: login }, { email: email }],
    });
    // await this.dataSource.query(
    //   `SELECT * FROM "user_entity" WHERE login = '${login}' OR email = '${email}'`,
    // );
    if (findUserQuery.length === 0) {
      return null;
    }

    const user = findUserQuery[0];
    return userToResendMessageMapper(user);
  }
  async findByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<FindUserByRecoveryCode> {
    const findUserQuery = await this.userEntityRepo.find({
      where: { login: login, email: email },
    });
    // await this.dataSource.query(
    //   `SELECT * FROM "user_entity" WHERE login = '${login}' AND email = '${email}'`,
    // );

    if (findUserQuery.length === 0) {
      return null;
    }

    const user = findUserQuery[0];
    return userToResendMessageMapper(user);
  }

  async findByEmailAndAddRecoveryCode(possibleUser: possibleUser) {
    return this.userEntityRepo.update(possibleUser.email, {
      recoveryCode: possibleUser.recoveryCode,
    });
    // await this.dataSource.query(
    //   `UPDATE "user_entity" SET recovery_code = ${possibleUser.recoveryCode} WHERE email = ${possibleUser.email}`,
    // );
  }
  // async findUserByCodeInValidation(
  //   code: string | null,
  // ): Promise<UserOutputModel | null> {
  //   const findUserQuery =
  //     'SELECT * FROM "user_entity" WHERE recovery_code = $1';
  //   const findUserValues = [code];
  //   const result = await this.dataSource
  //     .query(findUserQuery, findUserValues)
  //     .then((result) => result.rows);
  //
  //   if (result.length === 0) {
  //     return null;
  //   }
  //
  //   const user = result[0];
  //   const mappedUser = userMapper(user);
  //
  //   return mappedUser;
  // }

  async findUserByRecoveryCode(newDataUser: newDataUser2) {
    const findUserQuery = await this.userEntityRepo.update(
      newDataUser.recoveryCode,
      {
        passwordHash: newDataUser.newPassword,
        passwordSalt: newDataUser.newSalt,
      },
    );

    // this.dataSource.query(
    //   `UPDATE "user_entity" SET "passwordHash" = '${newDataUser.newPassword}', "passwordSalt" = '${newDataUser.newSalt}' WHERE "recoveryCode" = '${newDataUser.recoveryCode}' RETURNING *`,
    // );

    if (!findUserQuery) {
      return false;
    }

    return findUserQuery[0];

    // const deleteUserQuery = 'DELETE FROM "Users" WHERE "recovery_code" = ${}';
    // const deleteUserValues = [newDataUser.recoveryCode];
    // await this.dataSource.query(deleteUserQuery, deleteUserValues);
  }

  async updateCodeToResendingMessage(userEmail: string, info: any) {
    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    }).toISOString();

    await this.userEntityRepo.update(userEmail, {
      confirmationCode: info.confirmationCode,
      expirationDate: expirationDate,
    });

    // await this.dataSource.query(`
    // UPDATE "user_entity"
    // SET "confirmationCode" = '${info.confirmationCode}', "expirationDate" = '${expirationDate}'
    // WHERE "email" = '${userEmail}'
    // RETURNING * `);

    const findUserQuery = await this.userEntityRepo.find({
      where: { email: userEmail },
    });

    // await this.dataSource.query(
    //   `SELECT * FROM "user_entity" WHERE "email" = '${userEmail}'`,
    // );

    if (findUserQuery.length === 0) {
      return null;
    }

    const user = findUserQuery[0];
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
    const findUserInDB = await this.userEntityRepo.find({
      where: { id: userId },
    });
    // dataSource.query(
    //   `SELECT * FROM "user_entity" WHERE id = ${userId}`,
    // );
    if (!findUserInDB[0]) return false;
    const user = await this.userEntityRepo.delete(userId);

    // dataSource.query(
    //   `DELETE FROM public."user_entity" WHERE "id" = ${userId} ;`,
    // );
    if (user[1] > 0) return true;
  }
  //: Promise<UserMongoDbType>
  async saveUser(user: UserDbType): Promise<UserToShow> {
    const saveUserQuery = await this.userEntityRepo.create({
      login: user.login,
      email: user.email,
      passwordHash: user.passwordHash,
      passwordSalt: user.passwordSalt,
      createdAt: user.createdAt,
      confirmationCode: user.emailConfirmation.confirmationCode,
      expirationDate: user.emailConfirmation.expirationDate,
      isConfirmed: user.emailConfirmation.isConfirmed,
      recoveryCode: user.recoveryCode,
    });
    const saveUserToDB = await this.userEntityRepo.save(saveUserQuery);
    return {
      id: saveUserToDB.id.toString(),
      login: saveUserToDB.login,
      email: saveUserToDB.email,
      createdAt: saveUserToDB.createdAt,
    };
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
    emailConfirmation: {
      confirmationCode: user.confirmationCode,
      expirationDate: user.expirationDate,
      isConfirmed: user.isConfirmed,
    },
    recoveryCode: user.recoveryCode,
  };
};
