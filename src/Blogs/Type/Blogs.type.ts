import { WithId } from 'mongodb';
import { Length } from 'class-validator';

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
  @Length(0, 30)
  name: string;
  @Length(0, 100)
  description: string;
  @Length(0, 1000)
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
