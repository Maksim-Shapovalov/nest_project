import {
  BodyPostToRequest1,
  BodyUpdatingPost,
  PostClass,
} from './Type/Posts.type';
import { AvailableStatusEnum } from '../Comment/Type/Comment.type';
import { Injectable } from '@nestjs/common';
import { NewestPostLike } from '../Users/Type/User.type';
import { PostsPostgresTypeOrmRepository } from './TypeOrm/Posts.repo.TypeOrm';
import { BlogsSQLTypeOrmRepository } from '../Blogs/TypeOrm/Blogs.repo.TypeOrm';
@Injectable()
export class PostsService {
  constructor(
    protected postsSQLRepository: PostsPostgresTypeOrmRepository,
    protected blogsSQLRepository: BlogsSQLTypeOrmRepository,
  ) {}

  async createNewPosts(
    bodyPost: BodyPostToRequest1,
    userId: string,
    // blogId: string,
  ) {
    const findBlogName = await this.blogsSQLRepository.getBlogsById(
      bodyPost.blogId,
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
    postId: string,
    status: AvailableStatusEnum,
    user: NewestPostLike | null,
  ) {
    const findPosts = await this.postsSQLRepository.getPostsById(
      postId,
      user || null,
    );
    if (!findPosts) return null;
    const post = await this.postsSQLRepository.updateStatusLikeUser(
      postId,
      user || null,
      status,
    );
    return post;
  }

  async updatePostsById(postBody: BodyUpdatingPost): Promise<boolean> {
    return await this.postsSQLRepository.updatePostsById(postBody);
  }
  async updatePostsByIdInBlog(
    postBody: BodyUpdatingPost,
    blogId: string,
  ): Promise<boolean> {
    return await this.postsSQLRepository.updatePostsByIdInBlog(
      postBody,
      blogId,
    );
  }

  async deletePostsById(id: string): Promise<boolean> {
    return await this.postsSQLRepository.deletePostsById(id);
  }
}
