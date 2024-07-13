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
import { BlogsRepository } from '../Blogs.repository';
import { QueryType } from '../../Other/Query.Type';
import { queryFilter, searchNameInBlog } from '../../qurey-repo/query-filter';
import { BasicAuthGuard } from '../../auth/guard/basic-authGuard';
import { BodyPostToRequest } from '../../Posts/Type/Posts.type';
import { BlogRequest } from '../Type/Blogs.type';
import { PostsPostgresRepository } from '../../Posts/postgres/Posts.postgres.repository';
import { BlogsSQLTypeOrmRepository } from '../TypeOrm/Blogs.repo.TypeOrm';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsSQLController {
  constructor(
    protected postsService: PostsService,
    protected blogsService: BlogsService,
    protected blogsRepository: BlogsRepository,
    protected blogsSQLRepository: BlogsSQLTypeOrmRepository,
    protected postsSQLRepository: PostsPostgresRepository,
  ) {}
  @Get()
  async getAllBlogs(@Query() query: QueryType) {
    const filter = searchNameInBlog(query);
    return this.blogsRepository.getAllBlogs(filter);
  }
  @Get(':id')
  async getBlogById(@Param('id') id: number) {
    const blog = await this.blogsSQLRepository.getBlogsById(id);
    if (blog) {
      return blog;
    } else {
      throw new NotFoundException();
    }
  }
  //
  // @UseGuards(SoftAuthGuard)
  @Get(':id/posts')
  async getPostsByBlogId(@Param('id') id: number, @Query() query: QueryType) {
    const filter = queryFilter(query);
    const result = await this.postsSQLRepository.getPostInBlogs(
      id,
      filter,
      null,
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
    @Param('id') id: number,
    @Body() blogsInputModel: BodyPostToRequest,
    @Req() request,
  ) {
    const user = request.user;
    const findBlog = await this.blogsSQLRepository.getBlogsById(id);
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
  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePostInBlogByBlogIdAndPostId(
    @Param('blogId') blogId: number,
    @Param('postId') postId: number,
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
    const result = await this.postsService.updatePostsById(post);
    if (!result) {
      throw new NotFoundException();
    } else {
      return HttpCode(204);
    }
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteBlogById(@Param('id') id: number) {
    const deleted = await this.blogsService.deleteBlogsById(id);

    if (!deleted) {
      throw new NotFoundException();
    }
    return HttpCode(204);
  }
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePostInBlogById(
    @Param('blogId') blogId: number,
    @Param('postId') postId: number,
  ) {
    if (!blogId || !postId) throw new NotFoundException();
    const deleted = await this.blogsService.deletePostInBlogById(
      blogId,
      postId,
    );

    if (!deleted) {
      throw new NotFoundException();
    }
    return HttpCode(204);
  }
}
