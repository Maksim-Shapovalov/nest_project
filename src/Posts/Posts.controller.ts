import { PostsService } from './Posts.service';
import { CommentsService } from '../Comment/Comments.service';
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
import { NewestPostLike } from '../Users/Type/User.type';
import { QueryType } from '../Other/Query.Type';
import {
  BodyPostToRequest1,
  BodyUpdatingPost,
  StatusLikes,
} from './Type/Posts.type';
import { BearerGuard, User } from '../auth/guard/authGuard';
import { BasicAuthGuard } from '../auth/guard/basic-authGuard';
import { SoftAuthGuard } from '../auth/guard/softAuthGuard';
import { Trim } from '../Other/trim-validator';
import { IsNotEmpty, Length } from 'class-validator';

import { BearerAuthGuard } from '../auth/guard/bearer-authGuard';
import { CommentSqlRepository } from '../Comment/postgress/Comments.postgress.repository';
import { PostsPostgresRepository } from './postgres/Posts.postgres.repository';
import { UserSQLRepository } from '../Users/User.SqlRepositories';

export class ContentClass {
  @Trim()
  @IsNotEmpty()
  @Length(20, 300)
  content: string;
}

@Controller('posts')
export class PostsController {
  constructor(
    protected serviceComments: CommentsService,
    // protected postsRepository: PostsRepository,
    protected postsSQLRepository: PostsPostgresRepository,
    protected postsService: PostsService,
    protected commentsRepository: CommentSqlRepository,
    protected userSQLRepository: UserSQLRepository,
  ) {}
  @UseGuards(SoftAuthGuard)
  @Get()
  async getAllPostsInDB(@Query() query: QueryType, @Req() request) {
    const user = request.user;
    const filter = queryFilter(query);
    return this.postsSQLRepository.getAllPosts(filter, user?.userId);
  }
  // @UseGuards(SoftAuthGuard)
  //@Req() request
  @UseGuards(SoftAuthGuard)
  @Get(':id')
  @HttpCode(200)
  async getPostByPostId(
    @Param('id') id: number,
    @User() userModel: NewestPostLike,
  ) {
    const post = await this.postsSQLRepository.getPostsById(id, userModel);
    if (!post) throw new NotFoundException();
    return post;
  }

  @UseGuards(SoftAuthGuard)
  @Get(':id/comments')
  @HttpCode(200)
  async getCommentByCommendIdInPosts(
    @Query() query: QueryType,
    @Param('id') id: number,
    @Req() request,
  ) {
    if (!id) throw new NotFoundException();
    const user = request.user;
    const filter = queryFilter(query);
    const result = await this.commentsRepository.getCommentsInPost(
      id,
      filter,
      user || null,
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
    @Param('id') id: number,
    @Req() request,
  ) {
    const user = request.user as NewestPostLike;
    const result = await this.serviceComments.createdNewComments(
      id,
      contentInput.content,
      user,
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
    return this.postsService.createNewPosts(postBody, null);
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePostByPostId(
    @Param('id') postId: number,
    @Body() postInputModel: BodyPostToRequest1,
  ) {
    const bodyPost: BodyUpdatingPost = {
      postId: postId,
      title: postInputModel.title,
      shortDescription: postInputModel.shortDescription,
      content: postInputModel.content,
      blogId: postInputModel.blogId,
    };
    const result = await this.postsService.updatePostsById(bodyPost);
    if (!result) {
      throw new NotFoundException();
    } else {
      return HttpCode(204);
    }
  }
  @UseGuards(BearerAuthGuard)
  // @UseGuards(SoftAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async appropriationLike(
    @Param('id') id: number,
    @User() userModel: NewestPostLike,
    // @Req() request,
    @Body() inputLikeStatus: StatusLikes,
  ) {
    console.log(inputLikeStatus);
    // const user = request.user as NewestPostLike;
    const updateComment = await this.postsService.updateStatusLikeInUser(
      id,
      inputLikeStatus.likeStatus,
      userModel || null,
    );

    if (!updateComment) throw new NotFoundException();

    return HttpCode(204);
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePostByPostId(@Param('id') id: number) {
    const deleted = await this.postsService.deletePostsById(id);

    if (!deleted) throw new NotFoundException();

    return HttpCode(204);
  }
}
