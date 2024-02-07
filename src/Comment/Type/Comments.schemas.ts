import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AvailableStatusEnum } from './Comment.type';

export type CommentsDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  @Prop({ required: true })
  content: string;
  @Prop({
    required: true,
    type: {
      userId: String,
      userLogin: String,
    },
  })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true })
  createdAt: string;
}

export const CommentsSchema = SchemaFactory.createForClass(Comment);

export type CommentsLikeDocument = HydratedDocument<CommentsLike>;

@Schema()
export class CommentsLike {
  @Prop({ required: true })
  userId: string;
  @Prop({
    required: true,
    type: String,
    enum: Object.values(AvailableStatusEnum),
  })
  likesStatus: {
    type: string;
  };
  @Prop({ required: true })
  content: string;
}
export const CommentsLikeSchema = SchemaFactory.createForClass(CommentsLike);

// const likesSchema = new mongoose.Schema<LikesTypeDb>({
//     userId: {type: String, required: true},
//     likeStatus:  {
//         type: String,
//         enum: Object.values(AvailableStatusEnum),
//         required:true
//     },
//     commentId: {type: String, required: true},
// })
