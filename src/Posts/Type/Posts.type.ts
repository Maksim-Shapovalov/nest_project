import { WithId } from 'mongodb';
import { IsEnum, Length, Matches, Validate } from 'class-validator';
import { Trim } from '../../Other/trim-validator';
import { AvailableStatusEnum } from '../../Comment/Type/Comment.type';
import { CustomBlogIdValidation } from '../validation/BlogExists.decorator';

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
export class StatusLikes {
  @Trim()
  @IsEnum(AvailableStatusEnum)
  likeStatus: AvailableStatusEnum;
}

export class BodyPostToRequest {
  @Trim()
  @Length(1, 30)
  title: string;
  @Trim()
  @Length(1, 100)
  shortDescription: string;
  @Trim()
  @Length(1, 1000)
  content: string;
}
export class BodyPostToPut {
  @Trim()
  @Length(1, 30)
  title: string;
  @Trim()
  @Length(1, 100)
  shortDescription: string;
  @Trim()
  @Length(1, 1000)
  content: string;
  @Trim()
  @Validate(CustomBlogIdValidation)
  blogId: string;
}
export class BodyPostToRequest1 {
  @Trim()
  @Length(1, 30)
  title: string;
  @Trim()
  @Length(1, 100)
  shortDescription: string;
  @Trim()
  @Length(1, 1000)
  content: string;
  @Trim()
  @Validate(CustomBlogIdValidation)
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
