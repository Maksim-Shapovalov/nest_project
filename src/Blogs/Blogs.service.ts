import {
  BlogClass,
  BlogRequest,
  BlogsOutputModel,
  bodyForUpdateBlogs,
} from './Type/Blogs.type';

import { blogMapperSQL } from './postgres/Blogs.postgress.repository';
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
    return blogMapperSQL(res[0]);
  }
  async updateBlogById(blogs: bodyForUpdateBlogs): Promise<boolean> {
    return this.blogsSQLRepository.updateBlogById(blogs);
  }
  async deleteBlogsById(id: number): Promise<boolean> {
    return await this.blogsSQLRepository.deleteBlogsById(id);
  }
  async deletePostInBlogById(blogId: number, postId: number): Promise<boolean> {
    return await this.blogsSQLRepository.deletePostInBlogById(blogId, postId);
  }
}
// const blogMapper = (blog: WithId<BlogsType>): BlogsOutputModel => {
//   return {
//     id: blog._id.toHexString(),
//     name: blog.name,
//     description: blog.description,
//     websiteUrl: blog.websiteUrl,
//     createdAt: blog.createdAt,
//     isMembership: blog.isMembership,
//   };
// };
