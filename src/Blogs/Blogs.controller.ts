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
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BodyPostToRequest } from '../Posts/Type/Posts.type';
import { UserMongoDbType } from '../Users/Type/User.type';
import { BlogRequest } from './Type/Blogs.type';
import { QueryType } from '../Other/Query.Type';
import { HTTP_STATUS } from '../app.module';
@injectable()
@Controller()
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
      return;
    }
  }
  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') id: string,
    @Query() query: QueryType,
    @Body() userFind: UserMongoDbType,
  ) {
    const user = userFind;
    const filter = queryFilter(query);
    const result = await this.postsRepository.getPostInBlogs(
      id,
      filter,
      user._id.toString(),
    );
    if (!result) return HTTP_STATUS.NOT_FOUND_404;
    return result;
  }
  @Post(':id/posts')
  async createPostInBlogByBlogId(
    @Param('id') id: string,
    @Body() blogsInputModel: BodyPostToRequest,
    @Body() userFind: UserMongoDbType,
  ) {
    const user = userFind;
    const postBody = {
      title: blogsInputModel.title,
      shortDescription: blogsInputModel.shortDescription,
      content: blogsInputModel.content,
    };
    if (!user) {
      return this.postsService.createNewPosts(postBody, id, null);
    }
    const newPost = await this.postsService.createNewPosts(
      postBody,
      id,
      user._id.toString(),
    );
    if (!newPost) {
      return;
    }
    return newPost;
  }
  @Post()
  async createNewBlog(@Body() blogInputModel: BlogRequest) {
    const blog = {
      name: blogInputModel.name,
      description: blogInputModel.description,
      websiteUrl: blogInputModel.websiteUrl,
    };
    return this.blogsService.createNewBlogs(blog);
  }
  @Put(':id')
  async updateBlogByBlogId(
    @Param('id') id: string,
    @Body()
    blogUpdateModel: {
      id: string;
      name: string;
      description: string;
      websiteUrl: string;
    },
  ) {
    const result = await this.blogsService.updateBlogById(
      blogUpdateModel.id,
      blogUpdateModel.name,
      blogUpdateModel.description,
      blogUpdateModel.websiteUrl,
    );
    if (!result) {
      return HTTP_STATUS.NOT_FOUND_404;
    } else {
      return HTTP_STATUS.NO_CONTENT_204;
    }
  }
  @Delete(':id')
  async deleteBlogById(@Param('id') id: string) {
    const deleted = await this.blogsService.deleteBlogsById(id);

    if (!deleted) {
      return HTTP_STATUS.NOT_FOUND_404;
    }
    return HTTP_STATUS.NO_CONTENT_204;
  }
}
