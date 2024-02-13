import { injectable } from 'inversify';
import { InjectModel } from '@nestjs/mongoose';
import 'reflect-metadata';
import {
  Post,
  PostLike,
  PostLikeDocument,
  PostsDocument,
} from '../Posts/Type/Posts.schemas';
import { Model } from 'mongoose';
import {
  Comment,
  CommentsDocument,
  CommentsLike,
  CommentsLikeDocument,
} from '../Comment/Type/Comments.schemas';
import { Blog, UserDocument } from '../Blogs/Type/Blogs.schemas';
import { User, UserDocuments } from '../Users/Type/User.schemas';

@injectable()
export class AllDataClearRepo {
  constructor(
    @InjectModel(Post.name) protected postModel: Model<PostsDocument>,
    @InjectModel(PostLike.name)
    protected postLikeModel: Model<PostLikeDocument>,
    @InjectModel(Comment.name) protected commentModel: Model<CommentsDocument>,
    @InjectModel(CommentsLike.name)
    protected commentsLikeModel: Model<CommentsLikeDocument>,
    @InjectModel(Blog.name) protected blogModel: Model<UserDocument>,
    @InjectModel(User.name) protected userModel: Model<UserDocuments>,
  ) {}

  async dataClear() {
    await Promise.all([
      this.postModel.deleteMany({}),
      this.postLikeModel.deleteMany({}),
      this.commentModel.deleteMany({}),
      this.commentsLikeModel.deleteMany({}),
      this.blogModel.deleteMany({}),
      this.userModel.deleteMany({}),
    ]);
    return true;
  }
}
