import { WithId } from 'mongodb';
import { Length, Matches } from 'class-validator';
import { Trim } from '../../Other/trim-validator';

export class BlogClass {
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}

export type BlogsOutputModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export class BlogRequest {
  @Trim()
  @Length(0, 15)
  name: string;
  @Trim()
  @Length(0, 500)
  description: string;
  @Trim()
  @Length(0, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}

export type BlogsType = WithId<{
  // _id:
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}>;
