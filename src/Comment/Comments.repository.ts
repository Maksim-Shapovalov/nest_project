import { ObjectId, WithId } from 'mongodb';
import {
  AvailableStatusEnum,
  CommentsClass,
  CommentsTypeDb,
} from './Type/Comment.type';
import { PaginationQueryType } from '../qurey-repo/query-filter';

import { PostsRepository } from '../Posts/Posts.repository';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Comment,
  CommentsDocument,
  CommentsLike,
  CommentsLikeDocument,
} from './Type/Comments.schemas';
import { NewestPostLike } from '../Users/Type/User.type';

@injectable()
export class CommentsRepository {
  constructor(
    protected postsRepository: PostsRepository,
    @InjectModel(Comment.name) protected commentModel: Model<CommentsDocument>,
    @InjectModel(CommentsLike.name)
    protected commentsLikeModel: Model<CommentsLikeDocument>,
  ) {}
  async getCommentsInPost(
    postId: string,
    filter: PaginationQueryType,
    user: NewestPostLike,
  ) {
    const findPost = await this.postsRepository.getPostsById(
      postId,
      user.userId,
    );

    if (!findPost) {
      return null;
    }

    const filterQuery = { postId: findPost.id };

    const pageSizeInQuery: number = filter.pageSize;
    const totalCountBlogs = await this.commentModel.countDocuments(filterQuery);

    const pageCountBlogs: number = Math.ceil(totalCountBlogs / pageSizeInQuery);
    const pageComment: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const res = await this.commentModel
      .find(filterQuery)
      .sort({ [filter.sortBy]: filter.sortDirection })
      .skip(pageComment)
      .limit(pageSizeInQuery)
      .lean();

    const itemsPromises = res.map((c) => this.commentsMapper(c, user.userId));
    const items = await Promise.all(itemsPromises);

    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCountBlogs,
      items: items,
    };
  }

  async saveComments(comments: CommentsClass, userId: string) {
    const saveComments = await this.commentModel.create(comments);
    return this.commentsMapper(saveComments, userId);
  }

  async getCommentById(commentId: string, userId: string | null) {
    if (!ObjectId.isValid(commentId)) return null;
    const findComments = await this.commentModel.findOne({
      _id: new ObjectId(commentId),
    });
    if (!findComments) {
      return null;
    }
    return this.commentsMapper(findComments, userId);
  }

  async updateCommentsByCommentId(
    commentId: string,
    content: string,
  ): Promise<boolean> {
    const updateComment = await this.commentModel.updateOne(
      { _id: new ObjectId(commentId) },
      {
        $set: {
          content,
        },
      },
    );
    return updateComment.matchedCount === 1;
  }

  async updateStatusLikeUser(
    commentId: string,
    userId: string,
    status: string,
  ) {
    const likeWithUserId = await this.commentsLikeModel
      .findOne({
        userId,
        commentId,
      })
      .exec();

    const comment = await this.commentModel
      .findOne({
        _id: new ObjectId(commentId),
      })
      .exec();

    if (!comment) {
      return false;
    }

    if (likeWithUserId) {
      const updateStatus = await this.commentsLikeModel.updateOne(
        { commentId, userId },
        {
          $set: {
            likeStatus: status,
          },
        },
      );

      return updateStatus.matchedCount === 1;
    }

    await this.commentsLikeModel.create({
      commentId,
      userId,
      likeStatus: status,
    });

    return true;
  }

  async deleteCommentsByCommentId(commentId: string): Promise<boolean> {
    const deletedComment = await this.commentModel.deleteOne({
      _id: new ObjectId(commentId),
    });
    return deletedComment.deletedCount === 1;
  }
  async commentsMapper(comment: WithId<CommentsTypeDb>, userId: string | null) {
    const likeCount = await this.commentsLikeModel.countDocuments({
      likeStatus: AvailableStatusEnum.like,
      commentId: comment._id.toString(),
    });
    const dislikeCount = await this.commentsLikeModel.countDocuments({
      likeStatus: AvailableStatusEnum.dislike,
      commentId: comment._id.toString(),
    });

    const myStatus = await this.commentsLikeModel
      .findOne({
        userId,
        commentId: comment._id.toString(),
      })
      .exec();

    return {
      id: comment._id.toHexString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: +likeCount,
        dislikesCount: +dislikeCount,
        myStatus: myStatus ? myStatus.likesStatus : 'None',
      },
    };
  }
}
