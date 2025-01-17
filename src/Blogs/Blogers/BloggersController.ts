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
import { PostsService } from '../../Posts/Posts.service';
import { BlogsService } from '../Blogs.service';
import { BlogsSQLTypeOrmRepository } from '../TypeOrm/Blogs.repo.TypeOrm';
import { PostsPostgresTypeOrmRepository } from '../../Posts/TypeOrm/Posts.repo.TypeOrm';
import { QueryType } from '../../Other/Query.Type';
import { BearerGuard, User } from '../../auth/guard/authGuard';
import { NewestPostLike } from '../../Users/Type/User.type';
import { queryFilter, searchNameInBlog } from '../../qurey-repo/query-filter';
import { BodyPostToRequest } from '../../Posts/Type/Posts.type';
import { BlogRequest } from '../Type/Blogs.type';
@UseGuards(BearerGuard)
@Controller('blogger/blogs')
export class BloggersController {
  constructor(
    protected postsService: PostsService,
    protected blogsService: BlogsService,
    protected blogsSQLRepository: BlogsSQLTypeOrmRepository,
    protected postsSQLRepository: PostsPostgresTypeOrmRepository,
  ) {}

  @Get(':blogsId/posts')
  async getPostsByBlogId(
    @Param('blogsId') id: string,
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
  @Get()
  async getAllBlogs(@Query() query: QueryType) {
    const filter = searchNameInBlog(query);
    return this.blogsSQLRepository.getAllBlogs(filter);
  }
  @Post()
  async createNewBlog(
    @Body() blogInputModel: BlogRequest,
    @User() userModel: NewestPostLike,
  ) {
    const blog = {
      name: blogInputModel.name,
      description: blogInputModel.description,
      websiteUrl: blogInputModel.websiteUrl,
      userId: userModel.userId,
    };
    return this.blogsService.createNewBlogs(blog);
  }
  @Post(':id/posts')
  @HttpCode(201)
  async createPostInBlogByBlogId(
    @Param('id') id: string,
    @Body() blogsInputModel: BodyPostToRequest,
    @Req() request,
  ) {
    const user = request.user;
    const findBlog = await this.blogsSQLRepository.getBlogsById(id);
    console.log(findBlog, 'findBlog');
    if (!findBlog) throw new NotFoundException();
    const postBody = {
      title: blogsInputModel.title,
      shortDescription: blogsInputModel.shortDescription,
      content: blogsInputModel.content,
      blogId: id,
    };
    console.log(postBody, 'postBody');
    const newPost = await this.postsService.createNewPosts(
      postBody,
      user.userId,
    );
    if (!newPost) {
      throw new NotFoundException();
    }
    return newPost;
  }
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
  // TODO: updatePostByPostIdInBlogByBlogId изменить под пост
  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePostInBlogByBlogIdAndPostId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body()
    postUpdateModel: BodyPostToRequest,
  ) {
    if (!blogId || !postId) throw new NotFoundException();
    const post = {
      postId: postId,
      blogId: blogId,
      title: postUpdateModel.title,
      shortDescription: postUpdateModel.shortDescription,
      content: postUpdateModel.content,
    };
    const result = await this.postsService.updatePostsByIdInBlog(post, blogId);
    if (!result) {
      throw new NotFoundException();
    } else {
      return HttpCode(204);
    }
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: string) {
    const deleted = await this.blogsService.deleteBlogsById(id);

    if (!deleted) {
      throw new NotFoundException();
    }
    return HttpCode(204);
  }
  // TODO: deletePostByPostIdInBlogById изменить под пост
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePostInBlogById(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    if (!blogId || !postId) throw new NotFoundException();
    const deleted = await this.blogsService.deletePostInBlogById(
      blogId,
      postId,
    );
    console.log(deleted, 'deleted');

    if (!deleted) {
      throw new NotFoundException();
    }
    return HttpCode(204);
  }
}
