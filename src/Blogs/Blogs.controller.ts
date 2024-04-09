import { injectable } from 'inversify';
import { PostsService } from '../Posts/Posts.service';
import { BlogsService } from './Blogs.service';
import { BlogsRepository } from './Blogs.repository';
import { PostsRepository } from '../Posts/Posts.repository';
import { queryFilter, searchNameInBlog } from '../qurey-repo/query-filter';
import 'reflect-metadata';
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
  UseGuards,
} from '@nestjs/common';
import { BodyPostToRequest } from '../Posts/Type/Posts.type';
import { BlogRequest } from './Type/Blogs.type';
import { QueryType } from '../Other/Query.Type';
import { AuthGuard } from '../auth/guard/authGuard';

@injectable()
@Controller('blogs')
export class BlogsController {
  constructor(
    protected postsService: PostsService,
    protected blogsService: BlogsService,
    protected blogsRepository: BlogsRepository,
    protected postsRepository: PostsRepository,
  ) {}
  @Get()
  async getAllBlogs(@Query() query: QueryType) {
    const filter = searchNameInBlog(query);
    return this.blogsRepository.getAllBlogs(filter);
  }
  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    const blog = await this.blogsRepository.getBlogsById(id);
    if (blog) {
      return blog;
    } else {
      throw new NotFoundException();
    }
  }
  @Get(':id/posts')
  async getPostsByBlogId(@Param('id') id: string, @Query() query: QueryType) {
    const filter = queryFilter(query);
    const result = await this.postsRepository.getPostInBlogs(id, filter);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
  @Post(':id/posts')
  async createPostInBlogByBlogId(
    @Param('id') id: string,
    @Body() blogsInputModel: BodyPostToRequest,
  ) {
    const postBody = {
      title: blogsInputModel.title,
      shortDescription: blogsInputModel.shortDescription,
      content: blogsInputModel.content,
      blogId: id,
    };
    const newPost = await this.postsService.createNewPosts(postBody, id);
    if (!newPost) {
      throw new NotFoundException();
    }
    return newPost;
  }
  @UseGuards(AuthGuard)
  @Post()
  async createNewBlog(@Body() blogInputModel: BlogRequest) {
    const blog = {
      name: blogInputModel.name,
      description: blogInputModel.description,
      websiteUrl: blogInputModel.websiteUrl,
    };
    return this.blogsService.createNewBlogs(blog);
  }
  @UseGuards(AuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlogByBlogId(
    @Param('id') idBlogs: string,
    @Body()
    blogUpdateModel: BlogRequest,
  ) {
    const result = await this.blogsService.updateBlogById(
      idBlogs,
      blogUpdateModel.name,
      blogUpdateModel.description,
      blogUpdateModel.websiteUrl,
    );
    if (!result) {
      throw new NotFoundException();
    } else {
      return HttpCode(204);
    }
  }
  @UseGuards(AuthGuard)
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
