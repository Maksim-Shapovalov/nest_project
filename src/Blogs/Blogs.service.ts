import {
  BlogClass,
  BlogRequest,
  BlogsOutputModel,
  BlogsType,
  bodyForUpdateBlogs,
} from './Type/Blogs.type';
import { WithId } from 'mongodb';
import { injectable } from 'inversify';
import 'reflect-metadata';
import {
  blogMapperSQL,
  BlogsSQLRepository,
} from './postgres/Blogs.postgress.repository';
import { BlogsRepository } from './Blogs.repository';

@injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsSQLRepository: BlogsSQLRepository,
  ) {}
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
