import { PostsService } from '../Posts/Posts.service';
import { BlogsService } from './Blogs.service';
import { BlogsRepository } from './Blogs.repository';
import { queryFilter, searchNameInBlog } from '../qurey-repo/query-filter';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BodyPostToRequest } from '../Posts/Type/Posts.type';
import { BlogRequest } from './Type/Blogs.type';
import { QueryType } from '../Other/Query.Type';
import { BasicAuthGuard } from '../auth/guard/basic-authGuard';
import { SoftAuthGuard } from '../auth/guard/softAuthGuard';
import { User } from '../auth/guard/authGuard';
import { NewestPostLike } from '../Users/Type/User.type';
import { BlogsSQLTypeOrmRepository } from './TypeOrm/Blogs.repo.TypeOrm';
import { PostsPostgresTypeOrmRepository } from '../Posts/TypeOrm/Posts.repo.TypeOrm';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected postsService: PostsService,
    protected blogsService: BlogsService,
    protected blogsRepository: BlogsRepository,
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
  //
  @UseGuards(SoftAuthGuard)
  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') id: string,
    @Query() query: QueryType,
    @User() userModel: NewestPostLike,
  ) {
    const filter = queryFilter(query);
    const result = await this.postsSQLRepository.getPostInBlogs(
      id,
      filter,
      userModel,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  @HttpCode(201)
  async createPostInBlogByBlogId(
    @Param('id') id: string,
    @Body() blogsInputModel: BodyPostToRequest,
    @Req() request,
  ) {
    const user = request.user;
    const findBlog = await this.blogsRepository.getBlogsById(id);
    if (!findBlog) throw new NotFoundException();
    const postBody = {
      title: blogsInputModel.title,
      shortDescription: blogsInputModel.shortDescription,
      content: blogsInputModel.content,
      blogId: id,
    };
    const newPost = await this.postsService.createNewPosts(
      postBody,
      id,
      user ? user.userId : null,
    );
    if (!newPost) {
      throw new NotFoundException();
    }
    return newPost;
  }
  @UseGuards(BasicAuthGuard)
  @Post()
  async createNewBlog(@Body() blogInputModel: BlogRequest) {
    const blog = {
      name: blogInputModel.name,
      description: blogInputModel.description,
      websiteUrl: blogInputModel.websiteUrl,
    };
    return this.blogsService.createNewBlogs(blog);
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlogByBlogId(
    @Param('id') idBlogs: string,
    @Body()
    blogUpdateModel: BlogRequest,
  ) {
    const blogs = {
      id: idBlogs,
      name: blogUpdateModel.name,
      description: blogUpdateModel.description,
      websiteUrl: blogUpdateModel.websiteUrl,
    };
    const result = await this.blogsService.updateBlogById(blogs);
    if (!result) {
      throw new NotFoundException();
    } else {
      return HttpCode(204);
    }
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string) {
    const deleted = await this.blogsService.deleteBlogsById(id);

    if (!deleted) {
      throw new NotFoundException();
    }
    return HttpCode(204);
  }
}
