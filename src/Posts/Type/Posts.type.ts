import { WithId } from 'mongodb';

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

export type BodyPostToRequest = {
  title: string;
  shortDescription: string;
  content: string;
};

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
