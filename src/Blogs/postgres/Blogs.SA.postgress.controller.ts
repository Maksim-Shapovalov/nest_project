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
import { PostsService } from '../../Posts/Posts.service';
import { BlogsService } from '../Blogs.service';

import { QueryType } from '../../Other/Query.Type';
import { searchNameInBlog } from '../../qurey-repo/query-filter';
import { BasicAuthGuard } from '../../auth/guard/basic-authGuard';
import { PostsPostgresRepository } from '../../Posts/postgres/Posts.postgres.repository';
import { BlogsSQLTypeOrmRepository } from '../TypeOrm/Blogs.repo.TypeOrm';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsSQLController {
  constructor(
    protected postsService: PostsService,
    protected blogsService: BlogsService,
    protected blogsSQLRepository: BlogsSQLTypeOrmRepository,
    protected postsSQLRepository: PostsPostgresRepository,
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
