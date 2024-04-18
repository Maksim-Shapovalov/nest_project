import { BodyPostToRequest1, PostClass } from './Type/Posts.type';
import { PostsRepository } from './Posts.repository';
import { BlogsRepository } from '../Blogs/Blogs.repository';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { AvailableStatusEnum } from '../Comment/Type/Comment.type';
@injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async createNewPosts(
    bodyPost: BodyPostToRequest1,
    userId: string | null,
    blogId?: string,
  ) {
    const findBlogName = await this.blogsRepository.getBlogsById(
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

    return this.postsRepository.savePost(newPosts, userId);
  }
  async updateStatusLikeInUser(
    postId: string,
    userID: string,
    status: AvailableStatusEnum,
  ) {
    return this.postsRepository.updateStatusLikeUser(postId, userID, status);
  }

  async updatePostsById(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<boolean> {
    return await this.postsRepository.updatePostsById(
      id,
      title,
      shortDescription,
      content,
      blogId,
    );
  }

  async deletePostsById(id: string): Promise<boolean> {
    return await this.postsRepository.deletePostsById(id);
  }
}
