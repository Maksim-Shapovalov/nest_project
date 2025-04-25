import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from '../../post/aplication/Posts.service';
import { BlogsService } from '../aplication/Blogs.service';

import { QueryType } from '../../validate-middleware/Query.Type';
import { searchNameInBlog } from '../../validate-middleware/query-filter';
import { BasicAuthGuard } from '../../../core/guard/basic-authGuard';
import { BlogsSQLTypeOrmRepository } from '../infrastructure/Blogs.repo.TypeOrm';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsSQLController {
  constructor(
    protected postsService: PostsService,
    protected blogsService: BlogsService,
    protected blogsSQLRepository: BlogsSQLTypeOrmRepository,
  ) {}
  @Get()
  async getAllBlogs(@Query() query: QueryType, @Req() req) {
    const filter = searchNameInBlog(query);
    const takeBlogs = await this.blogsSQLRepository.getAllBlogs(
      filter,
      null,
      req.path,
    );
    return takeBlogs;
  }
  @Put(':id/bind-with-user/:userId')
  async getBlogById(@Param('id') id: string) {
    const blog = await this.blogsSQLRepository.getBlogsById(id);
    if (blog) {
      return blog;
    } else {
      throw new NotFoundException();
    }
  }
}
