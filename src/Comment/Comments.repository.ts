import { ObjectId, WithId } from 'mongodb';
import {
  AvailableStatusEnum,
  CommentsClass,
  CommentsOutputType,
  CommentsTypeDb,
} from './Type/Comment.type';
import {
  PaginationQueryType,
  PaginationType,
} from '../qurey-repo/query-filter';
import { CommentsModelClass, LikesModelClass } from './Type/Comments.schemas';

import { PostsRepository } from '../Posts/Posts.repository';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class CommentsRepository {
  constructor(protected postsRepository: PostsRepository) {}
  async getCommentsInPost(
    postId: string,
    filter: PaginationQueryType,
    userId: string | null,
  ): Promise<PaginationType<CommentsOutputType> | null> {
    const findPost = await this.postsRepository.getPostsById(postId, userId);

    if (!findPost) {
      return null;
    }

    const filterQuery = { postId: findPost.id };

    const pageSizeInQuery: number = filter.pageSize;
    const totalCountBlogs =
      await CommentsModelClass.countDocuments(filterQuery);

    const pageCountBlogs: number = Math.ceil(totalCountBlogs / pageSizeInQuery);
    const pageComment: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const res = await CommentsModelClass.find(filterQuery)
      .sort({ [filter.sortBy]: filter.sortDirection })
      .skip(pageComment)
      .limit(pageSizeInQuery)
      .lean();

    const itemsPromises = res.map((c) => commentsMapper(c, userId));
    const items = await Promise.all(itemsPromises);

    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCountBlogs,
      items: items,
    };
  }

  async saveComments(comments: CommentsClass): Promise<CommentsTypeDb> {
    return CommentsModelClass.create(comments);
  }

  async getCommentById(
    commentId: string,
    userId: string | null,
  ): Promise<CommentsOutputType | null> {
    if (!ObjectId.isValid(commentId)) return null;
    const findComments = await CommentsModelClass.findOne({
      _id: new ObjectId(commentId),
    });
    if (!findComments) {
      return null;
    }
    return commentsMapper(findComments, userId);
  }

  async updateCommentsByCommentId(
    commentId: string,
    content: string,
  ): Promise<boolean> {
    const updateComment = await CommentsModelClass.updateOne(
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
    const likeWithUserId = await LikesModelClass.findOne({
      userId,
      commentId,
    }).exec();

    const comment = await CommentsModelClass.findOne({
      _id: new ObjectId(commentId),
    }).exec();

    if (!comment) {
      return false;
    }

    if (likeWithUserId) {
      const updateStatus = await LikesModelClass.updateOne(
        { commentId, userId },
        {
          $set: {
            likeStatus: status,
          },
        },
      );

      return updateStatus.matchedCount === 1;
    }

    await LikesModelClass.create({ commentId, userId, likeStatus: status });

    return true;
  }

  async deleteCommentsByCommentId(commentId: string): Promise<boolean> {
    const deletedComment = await CommentsModelClass.deleteOne({
      _id: new ObjectId(commentId),
    });
    return deletedComment.deletedCount === 1;
  }
}

export const commentsMapper = async (
  comment: WithId<CommentsTypeDb>,
  userId: string | null,
): Promise<CommentsOutputType> => {
  const likeCount = await LikesModelClass.countDocuments({
    likeStatus: AvailableStatusEnum.like,
    commentId: comment._id.toString(),
  });
  const dislikeCount = await LikesModelClass.countDocuments({
    likeStatus: AvailableStatusEnum.dislike,
    commentId: comment._id.toString(),
  });

  const myStatus = await LikesModelClass.findOne({
    userId,
    commentId: comment._id.toString(),
  }).exec();

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
      myStatus: myStatus ? myStatus.likeStatus : 'None',
    },
  };
};
