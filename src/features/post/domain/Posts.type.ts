import { IsEnum, IsUUID, Length, Validate } from 'class-validator';
import { AvailableStatusEnum } from '../../comment/domain/Comment.type';
import { CustomBlogIdValidation } from '../../../core/decorators/BlogExists.decorator';

export class PostClass {
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public userId: string,
    public createdAt: string,
  ) {}
}

export type PostsOutputSQLType = {
  id: string;
  content: string;
  createdAt: string;
  title: string;
  shortDescription: string;
  blogId: string;
  blogName: string;
};

export class StatusLikes {
  @IsEnum(AvailableStatusEnum)
  likeStatus: AvailableStatusEnum;
}

export class BodyPostToRequest {
  @Length(1, 30)
  title: string;
  @Length(1, 100)
  shortDescription: string;
  @Length(1, 1000)
  content: string;
}
export class BodyPostToRequest1 {
  @Length(1, 30)
  title: string;
  @Length(1, 100)
  shortDescription: string;
  @Length(1, 1000)
  content: string;
  @Validate(CustomBlogIdValidation)
  @IsUUID(undefined, { each: true })
  blogId: string;
}

export class BodyUpdatingPost {
  @IsUUID(undefined, { each: true })
  postId: string;
  @Length(1, 30)
  title: string;
  @Length(1, 100)
  shortDescription: string;
  @Length(1, 1000)
  content: string;
  @Validate(CustomBlogIdValidation)
  @IsUUID(undefined, { each: true })
  blogId: string;
}
