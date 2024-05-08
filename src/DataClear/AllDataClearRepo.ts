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
import { Device, DeviceDocuments } from '../Device/Type/DataId.schemas';
import { RefreshToken, RefreshTokenDocuments } from '../Token/Token.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
    @InjectModel(Device.name) protected deviceModel: Model<DeviceDocuments>,
    @InjectModel(RefreshToken.name)
    protected tokenRefreshModel: Model<RefreshTokenDocuments>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async dataClear() {
    await Promise.all([
      this.postModel.deleteMany({}),
      this.postLikeModel.deleteMany({}),
      this.commentModel.deleteMany({}),
      this.commentsLikeModel.deleteMany({}),
      this.blogModel.deleteMany({}),
      this.userModel.deleteMany({}),
      this.deviceModel.deleteMany({}),
      this.tokenRefreshModel.deleteMany({}),
      this.dataSource.query(
        `DELETE FROM public."device"; DELETE FROM public."Users";`,
      ),
    ]);
    return true;
  }
}
