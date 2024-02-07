import { WithId } from 'mongodb';
import { UserMongoDbType } from '../../Users/Type/User.type';

export class CommentsClass {
  constructor(
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public postId: string,
    public createdAt: string,
    // public statuses: LikesTypeDb[]
  ) {}
}

export type CommentsTypeDb = WithId<{
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postId: string;
  createdAt: string;
  // statuses: LikesTypeDb[]
}>;
export type CommentsTypeOutputDb = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postId: string;
  createdAt: string;
  // statuses: LikesTypeDb[]
};

export type LikesTypeDb = WithId<{
  userId: string;
  likeStatus: string;
  commentId: string;
}>;

export enum AvailableStatusEnum {
  like = 'Like',
  none = 'None',
  dislike = 'Dislike',
}

export type CommentsOutputType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
};

export type CommentsInputModel = {
  postId: string;
  content: string;
  user: UserMongoDbType;
};
