import {
  BodyPostToRequest1,
  BodyUpdatingPost,
  PostClass,
} from '../domain/Posts.type';
import { AvailableStatusEnum } from '../../comment/domain/Comment.type';
import { Injectable } from '@nestjs/common';
import { NewestPostLike } from '../../users/domain/User.type';
import { PostsPostgresTypeOrmRepository } from '../infrastrucrue/Posts.repo.TypeOrm';
import { BlogsSQLTypeOrmRepository } from '../../blogs/infrastructure/Blogs.repo.TypeOrm';
@Injectable()
export class PostsService {
  constructor(
    protected postsSQLRepository: PostsPostgresTypeOrmRepository,
    protected blogsSQLRepository: BlogsSQLTypeOrmRepository,
  ) {}

  async createNewPosts(bodyPost: BodyPostToRequest1, userId: string) {
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
      userId,
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
