import { WithId } from 'mongodb';
import { Length, Matches } from 'class-validator';
import { Trim } from '../../../core/decorators/trim-validator';

export class BlogClass {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public userId: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}

export abstract class BlogsOutputModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}
export class BlogsOutputClassWithSA extends BlogsOutputModel {
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
}
export type bodyForUpdateBlogs = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
};

export class BlogRequest {
  @Length(1, 15)
  @Trim()
  name: string;
  @Length(1, 500)
  @Trim()
  description: string;
  @Length(1, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
