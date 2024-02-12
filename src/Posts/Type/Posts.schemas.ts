import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AvailableStatusEnum } from '../../Comment/Type/Comment.type';

@Schema()
export class Post {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogName: string;
  @Prop({ required: true })
  createdAt: string;
}
export type PostsDocument = HydratedDocument<Post>;
export const PostsSchema = SchemaFactory.createForClass(Post);

export type PostLikeDocument = HydratedDocument<PostLike>;

@Schema()
export class PostLike {
  @Prop({ required: true })
  postId: string;
  @Prop({
    required: true,
    type: String,
    enum: Object.values(AvailableStatusEnum),
  })
  likesStatus: { type: string };
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  login: string;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
