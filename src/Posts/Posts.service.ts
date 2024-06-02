import {
  BodyPostToRequest1,
  BodyUpdatingPost,
  PostClass,
} from './Type/Posts.type';
import { BlogsSQLRepository } from '../Blogs/postgres/Blogs.postgress.repository';
import { AvailableStatusEnum } from '../Comment/Type/Comment.type';
import { Injectable } from '@nestjs/common';
import { PostsPostgresRepository } from './postgres/Posts.postgres.repository';
import { NewestPostLike } from '../Users/Type/User.type';
@Injectable()
export class PostsService {
  constructor(
    protected postsSQLRepository: PostsPostgresRepository,
    protected blogsSQLRepository: BlogsSQLRepository,
  ) {}

  async createNewPosts(
    bodyPost: BodyPostToRequest1,
    userId: number | null,
    blogId?: number,
  ) {
    const findBlogName = await this.blogsSQLRepository.getBlogsById(
      blogId ?? bodyPost.blogId,
    );
    if (!findBlogName) {
      return null;
    }

    const newPosts = new PostClass(
      bodyPost.title,
      bodyPost.shortDescription,
      bodyPost.content,
      bodyPost.blogId,
      findBlogName.name,
      new Date().toISOString(),
    );

    return this.postsSQLRepository.savePost(newPosts, userId);
  }
  async updateStatusLikeInUser(
    postId: number,
    user: NewestPostLike,
    status: AvailableStatusEnum,
  ) {
    const findPosts = await this.postsSQLRepository.getPostsById(postId, user);
    if (!findPosts) return null;
    return this.postsSQLRepository.updateStatusLikeUser(postId, user, status);
  }

  async updatePostsById(postBody: BodyUpdatingPost): Promise<boolean> {
    return await this.postsSQLRepository.updatePostsById(postBody);
  }

  async deletePostsById(id: number): Promise<boolean> {
    return await this.postsSQLRepository.deletePostsById(id);
  }
}
