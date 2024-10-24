import {
  BlogClass,
  BlogRequest,
  BlogsOutputModel,
  bodyForUpdateBlogs,
} from './Type/Blogs.type';

import { Injectable } from '@nestjs/common';
import { BlogsSQLTypeOrmRepository } from './TypeOrm/Blogs.repo.TypeOrm';

@Injectable()
export class BlogsService {
  constructor(protected blogsSQLRepository: BlogsSQLTypeOrmRepository) {}
  async createNewBlogs(blog: BlogRequest): Promise<BlogsOutputModel> {
    const newBlogs = new BlogClass(
      blog.name,
      blog.description,
      blog.websiteUrl,
      new Date().toISOString(),
      false,
    );

    const res = await this.blogsSQLRepository.saveBlog(newBlogs);
    return res;
  }
  async updateBlogById(blogs: bodyForUpdateBlogs): Promise<boolean> {
    return this.blogsSQLRepository.updateBlogById(blogs);
  }
  async deleteBlogsById(id: string): Promise<boolean> {
    return await this.blogsSQLRepository.deleteBlogsById(id);
  }
  async deletePostInBlogById(blogId: string, postId: string): Promise<boolean> {
    return await this.blogsSQLRepository.deletePostInBlogById(blogId, postId);
  }
}
