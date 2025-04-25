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
import { PostsService } from '../../post/aplication/Posts.service';
import { BlogsService } from '../aplication/Blogs.service';
import { BlogsSQLTypeOrmRepository } from '../infrastructure/Blogs.repo.TypeOrm';
import { PostsPostgresTypeOrmRepository } from '../../post/infrastrucrue/Posts.repo.TypeOrm';
import { QueryType } from '../../validate-middleware/Query.Type';
import { BearerGuard } from '../../../core/guard/authGuard';
import { NewestPostLike } from '../../users/domain/User.type';
import {
  queryFilter,
  searchNameInBlog,
} from '../../validate-middleware/query-filter';
import { BodyPostToRequest } from '../../post/domain/Posts.type';
import { BlogRequest } from '../domain/Blogs.type';
import { BloggerAffiliationMiddleware } from '../../../core/guard/BloggerAffiliation.Middleware';
import { CommandBus } from '@nestjs/cqrs';
import { DeletePostInBlogByIdCommand } from './useCaseByBlogger/DeletePostInBlogById';
import { DeleteBlogByIdCommand } from './useCaseByBlogger/DeleteBlogsById';
import { UpdatePostsByIdInBlogCommand } from './useCaseByBlogger/UpdateBlogById';
import { CreateNewBlogsCommand } from './useCaseByBlogger/СreateNewBlogs';
import { User } from '../../../core/decorators/user.decorator';
@UseGuards(BearerGuard)
@Controller('blogger/blogs')
export class BloggersController {
  constructor(
    private commandBus: CommandBus,
    protected postsService: PostsService,
    protected blogsService: BlogsService,
    protected blogsSQLRepository: BlogsSQLTypeOrmRepository,
    protected postsSQLRepository: PostsPostgresTypeOrmRepository,
  ) {}
  @Get(':blogsId/posts')
  async getPostsByBlogId(
    @Param('blogsId') blogId: string,
    @Query() query: QueryType,
    @User() userModel: NewestPostLike,
  ) {
    const filter = queryFilter(query);
    const result = await this.postsSQLRepository.getPostInBlogs(
      blogId,
      filter,
      userModel,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
  @Get()
  async getAllBlogs(
    @Query() query: QueryType,
    @User() userModel: NewestPostLike,
  ) {
    const filter = searchNameInBlog(query);
    return this.blogsSQLRepository.getAllBlogs(filter, userModel);
  }
  @Post()
  async createNewBlog(
    @Body() blogInputModel: BlogRequest,
    @User() userModel: NewestPostLike,
  ) {
    return this.commandBus.execute(
      new CreateNewBlogsCommand(blogInputModel, userModel),
    );
  }
  @UseGuards(BloggerAffiliationMiddleware)
  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostInBlogByBlogId(
    @Param('blogId') blogId: string,
    @Body() blogsInputModel: BodyPostToRequest,
    @Req() request,
  ) {
    const user = request.user;
    const findBlog = await this.blogsSQLRepository.getBlogsById(blogId);
    if (!findBlog) throw new NotFoundException();
    const postBody = {
      title: blogsInputModel.title,
      shortDescription: blogsInputModel.shortDescription,
      content: blogsInputModel.content,
      blogId: blogId,
    };
    const newPost = await this.postsService.createNewPosts(
      postBody,
      user.userId,
    );
    if (!newPost) {
      throw new NotFoundException();
    }
    return newPost;
  }
  @UseGuards(BloggerAffiliationMiddleware)
  @Put(':blogId')
  @HttpCode(204)
  async updateBlogByBlogId(
    @Param('blogId') blogId: string,
    @Body()
    blogUpdateModel: BlogRequest,
  ) {
    const result = await this.commandBus.execute(
      new UpdatePostsByIdInBlogCommand(blogId, blogUpdateModel),
    );
    if (!result) {
      throw new NotFoundException();
    } else {
      return HttpCode(204);
    }
  }
  @UseGuards(BloggerAffiliationMiddleware)
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
  @UseGuards(BloggerAffiliationMiddleware)
  @Delete(':blogId')
  @HttpCode(204)
  async deleteBlogById(@Param('blogId') blogId: string) {
    const deleted = await this.commandBus.execute(
      new DeleteBlogByIdCommand(blogId),
    );
    if (!deleted) {
      throw new NotFoundException();
    }
    return HttpCode(204);
  }
  @UseGuards(BloggerAffiliationMiddleware)
  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePostInBlogById(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    if (!blogId || !postId) throw new NotFoundException();
    const deleted = await this.commandBus.execute(
      new DeletePostInBlogByIdCommand(blogId, postId),
    );
    if (!deleted) {
      throw new NotFoundException();
    }
    return HttpCode(204);
  }
}
