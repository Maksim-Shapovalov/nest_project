import { AvailableStatusEnum, CommentsClass } from './Type/Comment.type';
import { Injectable } from '@nestjs/common';
import { NewestPostLike } from '../Users/Type/User.type';
import { PostsPostgresRepository } from '../Posts/postgres/Posts.postgres.repository';
import { CommentSqlRepository } from './postgress/Comments.postgress.repository';

@Injectable()
export class CommentsService {
  constructor(
    protected postsSQLRepository: PostsPostgresRepository,
    protected commentsRepository: CommentSqlRepository,
  ) {}
  async createdNewComments(
    postId: number,
    content: string,
    userId: NewestPostLike,
  ) {
    const post = await this.postsSQLRepository.getPostsById(postId, userId);

    if (!post) {
      return null;
    }

    const newComment = new CommentsClass(
      content,
      {
        userId: userId.userId,
        userLogin: userId.login,
      },
      postId,
      new Date().toISOString(),
    );

    return this.commentsRepository.saveComments(newComment, userId.userId);
  }

  async updateComment(commentId: number, content: string) {
    return await this.commentsRepository.updateCommentsByCommentId(
      commentId,
      content,
    );
  }
  async updateStatusLikeInUser(
    commentId: number,
    userId: number,
    status: AvailableStatusEnum,
  ) {
    return this.commentsRepository.updateStatusLikeUser(
      commentId,
      userId,
      status,
    );
  }

  async deletedComment(commentId: number) {
    return await this.commentsRepository.deleteCommentsByCommentId(commentId);
  }
}
