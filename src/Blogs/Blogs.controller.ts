import { queryFilter, searchNameInBlog } from '../qurey-repo/query-filter';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';

import { QueryType } from '../Other/Query.Type';

import { BlogsSQLTypeOrmRepository } from './TypeOrm/Blogs.repo.TypeOrm';
import { PostsPostgresTypeOrmRepository } from '../Posts/TypeOrm/Posts.repo.TypeOrm';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsSQLRepository: BlogsSQLTypeOrmRepository,
    protected postsSQLRepository: PostsPostgresTypeOrmRepository,
  ) {}
  @Get()
  async getAllBlogs(@Query() query: QueryType) {
    const filter = searchNameInBlog(query);
    return this.blogsSQLRepository.getAllBlogs(filter);
  }
  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    const blog = await this.blogsSQLRepository.getBlogsById(id);
    if (blog) {
      return blog;
    } else {
      throw new NotFoundException();
    }
  }
  @Get(':id/posts')
  async getPostsInBlogById(@Param('id') id: string, @Query() query: QueryType) {
    const filter = queryFilter(query);
    const postInBlog = await this.postsSQLRepository.getPostInBlogs(
      id,
      filter,
      null,
    );
    if (postInBlog) {
      return postInBlog;
    } else {
      throw new NotFoundException();
    }
  }
}
