import { AvailableStatusEnum, CommentsClass } from '../domain/Comment.type';
import { Injectable } from '@nestjs/common';
import { NewestPostLike } from '../../users/domain/User.type';
import { CommentSqlTypeOrmRepository } from '../infrastructure/Comments.repo.TypeOrm';
import { PostsPostgresTypeOrmRepository } from '../../post/infrastrucrue/Posts.repo.TypeOrm';

@Injectable()
export class CommentsService {
  constructor(
    protected postsSQLRepository: PostsPostgresTypeOrmRepository,
    protected commentsRepository: CommentSqlTypeOrmRepository,
  ) {}
  async createdNewComments(
    postId: string,
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

  async updateComment(commentId: string, content: string) {
    return await this.commentsRepository.updateCommentsByCommentId(
      commentId,
      content,
    );
  }
  async updateStatusLikeInUser(
    commentId: string,
    userId: string,
    status: AvailableStatusEnum,
  ) {
    return this.commentsRepository.updateStatusLikeUser(
      commentId,
      userId,
      status,
    );
  }

  async deletedComment(commentId: string) {
    return await this.commentsRepository.deleteCommentsByCommentId(commentId);
  }
}
