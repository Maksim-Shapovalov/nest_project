import 'reflect-metadata';
import { injectable } from 'inversify';
import { PostsService } from './Posts.service';
import { PostsRepository } from './Posts.repository';
import { CommentsService } from '../Comment/Comments.service';
import { CommentsRepository } from '../Comment/Comments.repository';
import { queryFilter } from '../qurey-repo/query-filter';

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
import { WithId } from 'mongodb';
import { NewestPostLike, UserMongoDbType } from '../Users/Type/User.type';
import { QueryType } from '../Other/Query.Type';
import {
  BodyPostToPut,
  BodyPostToRequest1,
  StatusLikes,
} from './Type/Posts.type';
import { BearerGuard, User } from '../auth/guard/authGuard';
import { BasicAuthGuard } from '../auth/guard/basic-authGuard';
import { BearerAuthGuard } from '../auth/guard/bearer-authGuard';

@injectable()
@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsRepository: PostsRepository,
    protected serviceComments: CommentsService,
    protected commentsRepository: CommentsRepository,
  ) {}
  @Get()
  async getAllPostsInDB(@Query() query: QueryType) {
    const filter = queryFilter(query);
    return this.postsRepository.getAllPosts(filter);
  }
  @UseGuards(BearerGuard)
  @Get(':id')
  @HttpCode(200)
  async getPostByPostId(@Param('id') id: string, @Req() request) {
    const user = request.user;
    console.log(user, 'user');
    const post = await this.postsRepository.getPostsById(
      id,
      user ? user.userId : null,
    );
    if (!post) throw new NotFoundException();
    return post;
  }
  @Get(':id/comments')
  @HttpCode(204)
  async getCommentByCommendIdInPosts(
    @Query() query: QueryType,
    @Param('id') id: string,
  ) {
    const filter = queryFilter(query);
    const result = await this.commentsRepository.getCommentsInPost(id, filter);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
  @Post(':id')
  @HttpCode(204)
  async createCommentsInPostById(
    @Body() contentInput: string,
    @Param('id') id: string,
    @Body() userFind: WithId<UserMongoDbType>,
  ) {
    const result = await this.serviceComments.createdNewComments(
      id,
      contentInput,
      userFind,
    );

    if (!result) throw new NotFoundException();

    return result;
  }
  @UseGuards(BasicAuthGuard)
  @Post()
  async createNewPost(@Body() postInputModel: BodyPostToRequest1) {
    const postBody = {
      title: postInputModel.title,
      shortDescription: postInputModel.shortDescription,
      content: postInputModel.content,
      blogId: postInputModel.blogId,
    };
    return this.postsService.createNewPosts(postBody);
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePostByPostId(
    @Param('id') userId: string,
    @Body() postInputModel: BodyPostToPut,
  ) {
    const result = await this.postsService.updatePostsById(
      userId,
      postInputModel.title,
      postInputModel.shortDescription,
      postInputModel.content,
      postInputModel.blogId,
    );
    if (!result) {
      throw new NotFoundException();
    } else {
      return HttpCode(204);
    }
  }
  // @UseGuards(AuthGuard)
  @UseGuards(BearerAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async appropriationLike(
    @Param('id') id: string,
    @User() userModel: { userId: string },
    @Body() inputLikeStatus: StatusLikes,
  ) {
    const findPosts = await this.postsRepository.getPostsById(id, null);
    console.log(userModel);
    console.log(inputLikeStatus, '23o84372394561238741');
    if (!findPosts) throw new NotFoundException();
    const updateComment = await this.postsService.updateStatusLikeInUser(
      id,
      userModel.userId,
      inputLikeStatus.likeStatus,
    );

    if (!updateComment) throw new NotFoundException();

    return HttpCode(204);
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePostByPostId(@Param('id') id: string) {
    const deleted = await this.postsService.deletePostsById(id);

    if (!deleted) throw new NotFoundException();

    return HttpCode(204);
  }
}
