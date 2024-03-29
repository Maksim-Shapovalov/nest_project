import { WithId } from 'mongodb';
import { Length, Matches } from 'class-validator';

export class PostClass {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
    // public commentatorInfo: {
    //     userId: string
    //     userLogin: string
  ) {}
}
export type PostsOutputType = {
  id: string;
  content: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[];
  };
  title: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
};

export type PostOutputModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[];
  };
};

export type PostLikesDB = WithId<{
  postId: string;
  likesStatus: string;
  userId: string;
  createdAt: string;
  login: string;
}>;
export type LastThreeLikeUserInPost = [
  {
    postId: string;
    likeStatus: string;
    userId: string;
    createdAt: string;
  },
];

export class BodyPostToRequest {
  @Length(0, 15)
  title: string;
  @Length(0, 500)
  shortDescription: string;
  @Length(0, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  content: string;
}
export class BodyPostToPut {
  @Length(0, 15)
  title: string;
  @Length(0, 500)
  shortDescription: string;
  @Length(0, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  content: string;
  blogId: string;
}
export class BodyPostToRequest1 {
  @Length(0, 30)
  title: string;
  @Length(0, 100)
  shortDescription: string;
  @Length(0, 1000)
  content: string;
  blogId: string;
}

export type PostsType = WithId<{
  // id: string
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
}>;
