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
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NewestPostLike } from '../Users/Type/User.type';
import { QueryType } from '../Other/Query.Type';
import {
  BodyPostToPut,
  BodyPostToRequest1,
  StatusLikes,
} from './Type/Posts.type';
import { BearerGuard, User } from '../auth/guard/authGuard';
import { BasicAuthGuard } from '../auth/guard/basic-authGuard';
import { BearerAuthGuard } from '../auth/guard/bearer-authGuard';
import { HTTP_STATUS } from '../app.module';
import { SoftAuthGuard } from '../auth/guard/softAuthGuard';
import { Trim } from '../Other/trim-validator';
import { IsNotEmpty, Length } from 'class-validator';
import { ObjectId } from 'mongodb';

export class ContentClass {
  @Trim()
  @IsNotEmpty()
  @Length(20, 300)
  content: string;
}
@injectable()
@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected postsRepository: PostsRepository,
    protected serviceComments: CommentsService,
    protected commentsRepository: CommentsRepository,
  ) {}
  @UseGuards(SoftAuthGuard)
  @Get()
  async getAllPostsInDB(@Query() query: QueryType, @Req() request) {
    const user = request.user;
    const filter = queryFilter(query);
    return this.postsRepository.getAllPosts(filter, user ? user.userId : null);
  }
  @UseGuards(SoftAuthGuard)
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
  @UseGuards(SoftAuthGuard)
  @Get(':id/comments')
  @HttpCode(200)
  async getCommentByCommendIdInPosts(
    @Headers() header,
    @Query() query: QueryType,
    @Param('id') id: string,
    @Req() request,
  ) {
    if (!header) throw new NotFoundException();
    if (!ObjectId.isValid(id)) throw new NotFoundException();
    if (!id) throw new NotFoundException();
    const user = request.user;
    const filter = queryFilter(query);
    const result = await this.commentsRepository.getCommentsInPost(
      id,
      filter,
      user,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
  @UseGuards(BearerGuard)
  @Post(':id/comments')
  @HttpCode(201)
  async createCommentsInPostById(
    @Body() contentInput: ContentClass,
    @Param('id') id: string,
    @Req() request,
  ) {
    const user = request.user as NewestPostLike;
    const result = await this.serviceComments.createdNewComments(
      id,
      contentInput.content,
      user,
    );
    console.log(result, 'result');

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
    return this.postsService.createNewPosts(postBody, null);
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
