import { CommentsRepository } from './Comments.repository';
import { CommentsClass } from './Type/Comment.type';
import { WithId } from 'mongodb';
import { NewestPostLike, UserMongoDbType } from '../Users/Type/User.type';
import { PostsRepository } from '../Posts/Posts.repository';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
  ) {}
  async createdNewComments(
    postId: string,
    content: string,
    userId: NewestPostLike | null,
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
    status: string,
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
