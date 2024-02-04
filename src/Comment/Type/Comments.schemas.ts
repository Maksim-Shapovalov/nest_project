import mongoose, { Types } from 'mongoose';
import {
  AvailableStatusEnum,
  CommentsTypeDb,
  LikesTypeDb,
} from './Comment.type';

const likesSchema = new mongoose.Schema<LikesTypeDb>({
  userId: { type: String, required: true },
  likeStatus: {
    type: String,
    enum: Object.values(AvailableStatusEnum),
    required: true,
  },
  commentId: { type: String, required: true },
});

const commentSchema = new mongoose.Schema<CommentsTypeDb>({
  content: { type: String, required: true },
  commentatorInfo: {
    type: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
    required: true,
  },
  postId: { type: String, required: true },
  createdAt: { type: String, required: true },
  //statuses: {type: [likesSchema]},
});

export const LikesModelClass = mongoose.model('likes', likesSchema);
export const CommentsModelClass = mongoose.model('comments', commentSchema);
