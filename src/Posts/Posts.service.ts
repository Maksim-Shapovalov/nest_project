import {
  BodyPostToRequest1,
  BodyUpdatingPost,
  PostClass,
} from './Type/Posts.type';
import { BlogsRepository } from '../Blogs/Blogs.repository';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { BlogsSQLRepository } from '../Blogs/postgres/Blogs.postgress.repository';
import { PostsPostgresRepository } from './postgres/Posts.postgres.repository';
@injectable()
export class PostsService {
  constructor(
    protected postsSQLRepository: PostsPostgresRepository,
    // protected postsRepository: PostsSQLRepository,
    protected blogsRepository: BlogsRepository,
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

    return this.postsSQLRepository.savePost(newPosts);
  }
  // async updateStatusLikeInUser(
  //   postId: string,
  //   userID: number,
  //   status: AvailableStatusEnum,
  // ) {
  //   return this.postsSQLRepository.updateStatusLikeUser(postId, userID, status);
  // }

  async updatePostsById(postBody: BodyUpdatingPost): Promise<boolean> {
    return await this.postsSQLRepository.updatePostsById(postBody);
  }

  async deletePostsById(id: number): Promise<boolean> {
    return await this.postsSQLRepository.deletePostsById(id);
  }
}
