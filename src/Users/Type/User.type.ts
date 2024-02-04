import { WithId } from 'mongodb';

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
}

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
export type UserBasicRequestBody = {
  login: string;
  password: string;
  email: string;
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

export type EmailConfirmations = {
  confirmationCode: string;
  expirationDate: string;
  isConfirmed: boolean;
};
