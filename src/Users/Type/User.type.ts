import { WithId } from 'mongodb';
import { IsEmail, Length, Matches } from 'class-validator';

export class UserDbType {
  constructor(
    public login: string,
    public email: string,
    public passwordHash: any,
    public passwordSalt: string,
    public createdAt: string,
    public emailConfirmation: EmailConfirmations,
    public recoveryCode: string,
  ) {}

  static UserInReqMapper(user: any): NewestPostLike {
    return {
      userId: user.id,
      addedAt: user.createdAt,
      login: user.login,
    };
  }
}

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

export class UserBasicRequestBody {
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;
  @Length(6, 20)
  password: string;
  @IsEmail()
  email: string;
}
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
