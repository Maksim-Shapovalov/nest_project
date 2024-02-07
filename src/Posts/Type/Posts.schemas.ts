import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AvailableStatusEnum } from '../../Comment/Type/Comment.type';

export type PostsDocument = HydratedDocument<Post>;

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

export const PostsSchema = SchemaFactory.createForClass(Post);

export type PostLikeDocument = HydratedDocument<PostLike>;

@Schema()
export class PostLike {
  @Prop({ required: true })
  postId: string;
  // @Prop({
  //   required: true,
  //   type: { type: String, enum: Object.values(AvailableStatusEnum), },
  // })
  likesStatus: { type: string };
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  login: string;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

// const postLike = new mongoose.Schema<PostLikesDB>({
//   postId: { type: String, required: true },
//   likesStatus: {
//     type: String,
//     enum: Object.values(AvailableStatusEnum),
//     required: true,
//   },
//   userId: { type: String, required: true },
//   createdAt: { type: String, required: true },
//   login: { type: String, required: true },
// });
