import {
  PaginationType,
  UserPaginationQueryType,
} from '../../validate-middleware/query-filter';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserToShow } from '../domain/User.type';
import add from 'date-fns/add';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '../domain/User.entity';
import { BanUserDto } from '../api/dto/update-ban.user.dto';
import { EmailConfirmationEntity } from '../domain/Email.confirmation.entity';

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
  async getUserById(id: string): Promise<User | null> {
    const getUserQuery = await this.userEntityRepo.findOne({
      where: { id: id },
    });
    if (!getUserQuery) return null;
    return this.userToResendMessageMapper(getUserQuery);
  }
  async findUsersByCode(codeUser: string): Promise<User> {
    const getUsersQuery = await this.userEntityRepo.findOne({
      where: { emailConfirmation: { confirmationCode: codeUser } },
    });

    return getUsersQuery ? this.userToResendMessageMapper(getUsersQuery) : null;
  }
  async getUserByCode(codeUser: string): Promise<boolean> {
    await this.userEntityRepo.update(codeUser, {
      emailConfirmation: { isConfirmed: true },
    });
    return true;
  }
  async findUserInDBAndBanOrUnban(
    userId: string,
    solution: BanUserDto,
  ): Promise<boolean> {
    const findUserAndReplacementStatus = await this.userEntityRepo.update(
      userId,
      {
        isBanned: solution.isBanned,
        banReason: solution.banReason,
      },
    );
    if (!findUserAndReplacementStatus) return null;
    return true;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User> {
    const findUserQuery = await this.userEntityRepo.findOne({
      where: [
        { login: loginOrEmail, isBanned: false },
        { email: loginOrEmail, isBanned: false },
      ],
      relations: { emailConfirmation: true },
    });
    return findUserQuery ? this.userToResendMessageMapper(findUserQuery) : null;
  }
  async findByLoginOrEmailByOneUser(
    login: string,
    email: string,
  ): Promise<User> {
    const findUserQuery = await this.userEntityRepo.findOne({
      where: [{ login: login }, { email: email }],
      relations: { emailConfirmation: true },
    });
    return findUserQuery ? this.userToResendMessageMapper(findUserQuery) : null;
  }
  async findByLoginAndEmail(login: string, email: string): Promise<User> {
    const findUserQuery = await this.userEntityRepo.find({
      where: { login: login, email: email },
      relations: { emailConfirmation: true },
    });

    if (findUserQuery.length === 0) {
      return null;
    }

    const user = findUserQuery[0];
    return this.userToResendMessageMapper(user);
  }

  async findByEmailAndAddRecoveryCode(possibleUser: possibleUser) {
    return this.userEntityRepo.update(possibleUser.email, {
      recoveryCode: possibleUser.recoveryCode,
    });
  }

  async findUserByRecoveryCode(newDataUser: newDataUser2) {
    const findUserQuery = await this.userEntityRepo.update(
      newDataUser.recoveryCode,
      {
        password: newDataUser.newPassword,
      },
    );

    if (!findUserQuery) {
      return false;
    }

    return findUserQuery[0];
  }

  async updateCodeToResendingMessage(userEmail: string, info: any) {
    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    }).toISOString();

    await this.userEntityRepo.update(userEmail, {
      emailConfirmation: {
        confirmationCode: info.confirmationCode,
        expirationDate: expirationDate,
      },
    });

    const findUserQuery = await this.userEntityRepo.findOne({
      where: { email: userEmail },
    });

    return findUserQuery ? findUserQuery : null;
  }

  async deleteUserById(userId: string) {
    const findUserInDB = await this.userEntityRepo.findOne({
      where: { id: userId },
    });

    if (!findUserInDB) return false;
    return this.userEntityRepo.delete(userId);
  }

  async saveUser(user: User): Promise<UserEntity> {
    const newUser = new UserEntity();
    newUser.login = user.getLogin();
    newUser.password = user.getPassword();
    newUser.email = user.getEmail();
    newUser.createdAt = user.getCreatedAt();
    newUser.recoveryCode = user.getRecoveryCode();
    newUser.emailConfirmation.confirmationCode = user.getConfirmationCode();
    newUser.emailConfirmation.expirationDate = user.getExpirationDate();
    newUser.emailConfirmation.isConfirmed = user.getIsConfirmed();
    console.log(newUser, '---------newUser');
    const saveUser = await this.userEntityRepo.save(newUser);
    // const emailConfirmation = new EmailConfirmationEntity();
    // emailConfirmation.confirmationCode = user.getConfirmationCode();
    // emailConfirmation.expirationDate = user.getExpirationDate();
    // emailConfirmation.isConfirmed = user.getIsConfirmed();
    // emailConfirmation.userId = saveUser.id;
    // await this.userEntityRepo.manager.save(emailConfirmation);
    console.log(saveUser, '-----------saveUser');
    return saveUser;
  }

  public userToResendMessageMapper(user: UserEntity): User {
    return User.restore(
      user.id,
      user.login,
      user.email,
      user.password,
      user.createdAt,
      user.emailConfirmation.confirmationCode,
      user.emailConfirmation.expirationDate,
      user.emailConfirmation.isConfirmed,
      user.recoveryCode,
      user.isBanned,
      user.banReason,
    );
  }
}

export const userToPostMapper = (user: any): UserToShow => {
  return {
    id: user.id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
  };
};
