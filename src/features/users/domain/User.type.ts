import { WithId } from 'mongodb';
import { IsEmail, Length, Matches } from 'class-validator';
import { randomUUID } from 'crypto';
import add from 'date-fns/add';

export type NewestPostLike = {
  userId: string;
  addedAt: string;
  login: string;
};

export type UserOutputModel = {
  id: string;
  login: string;
  email: string;
  passwordHash: any;
  passwordSalt: string;
  createdAt: string;
};
//
export type UserToPostsOutputModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};
//
export type UserToShow = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UserMongoDbType = WithId<{
  login: string;
  email: string;
  passwordHash: any;
  passwordSalt: string;
  createdAt: string;
  emailConfirmation: EmailConfirmations;
  recoveryCode: string;
}>;
export type FindUserByRecoveryCode = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  passwordHash: any;
  passwordSalt: string;
  emailConfirmation: EmailConfirmations;
  recoveryCode: string;
};

export type EmailConfirmations = {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
};

export type BodyUserToLogin = {
  loginOrEmail: string;
  password: string;
};

export class User {
  constructor(
    private readonly id: string,
    private login: string,
    private email: string,
    private password: string,
    private createdAt: Date,
    private confirmationCode: string,
    private expirationDate: Date,
    private isConfirmed: boolean,
    private recoveryCode: string,
    private isBanned: boolean,
    private banReason: string,
  ) {}

  static restore(
    id: string,
    login: string,
    password: string | null,
    email: string,
    createdAt: Date,
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean,
    recoveryCode: string | null,
    isBanned: boolean,
    banReason: string,
  ): User {
    return new User(
      id,
      login,
      email,
      password,
      createdAt,
      confirmationCode,
      expirationDate,
      isConfirmed,
      recoveryCode,
      isBanned,
      banReason,
    );
  }
  static create(login: string, password: string, email: string): User {
    return new User(
      '0',
      login,
      email,
      password,
      new Date(),
      randomUUID(),
      add(new Date(), { hours: 1, minutes: 30 }),
      false,
      null,
      false,
      null,
    );
  }
  getId(): string {
    return this.id;
  }
  getLogin(): string {
    return this.login;
  }
  getEmail(): string {
    return this.email;
  }
  getPassword(): string {
    return this.password;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
  getConfirmationCode(): string {
    return this.confirmationCode;
  }
  getExpirationDate(): Date {
    return this.expirationDate;
  }
  getIsConfirmed(): boolean {
    return this.isConfirmed;
  }
  getRecoveryCode(): string {
    return this.recoveryCode;
  }
  getIsBanned(): boolean {
    return this.isBanned;
  }
  getBanReason(): string {
    return this.banReason;
  }
}
