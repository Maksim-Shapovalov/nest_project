import { CommentsRepository } from './Comments.repository';
import { AvailableStatusEnum, CommentsClass } from './Type/Comment.type';

import { NewestPostLike } from '../Users/Type/User.type';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { PostsRepository } from '../Posts/PostsSQLRepository';

@injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
  ) {}
  async createdNewComments(
    postId: string,
    content: string,
    userId: NewestPostLike,
  ) {
    const post = await this.postsRepository.getPostsById(postId, userId.userId);

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
