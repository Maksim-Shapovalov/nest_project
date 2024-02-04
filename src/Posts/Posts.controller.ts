import 'reflect-metadata';
import { injectable } from 'inversify';
import { PostsService } from './Posts.service';
import { PostsRepository } from './Posts.repository';
import { CommentsService } from '../Comment/Comments.service';
import { CommentsRepository } from '../Comment/Comments.repository';
import { Request, Response } from 'express';
import { queryFilter } from '../qurey-repo/query-filter';
import { HTTP_STATUS } from '../Index';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { WithId } from 'mongodb';
import { UserMongoDbType } from '../Users/Type/User.type';
import { QueryType } from '../Other/Query.Type';
import { BodyPostToRequest } from './Type/Posts.type';

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
  async getAllPostsInDB(
    @Body() userFind: WithId<UserMongoDbType>,
    @Query() query: QueryType,
  ) {
    const user = userFind;
    if (!user) {
      const filter = queryFilter(query);
      return this.postsRepository.getAllPosts(filter, null);
    }
    const filter = queryFilter(query);
    return this.postsRepository.getAllPosts(filter, user._id.toString());
  }
  @Get(':id')
  async getPostByPostId(
    @Param('id') id: string,
    @Body() userFind: WithId<UserMongoDbType>,
  ) {
    const user = userFind;
    if (!user) {
      // const filter = queryFilter(req.query);
      return this.postsRepository.getPostsById(id, null);
    }
    const post = await this.postsRepository.getPostsById(
      id,
      user._id.toString(),
    );
    if (!post) return HTTP_STATUS.NOT_FOUND_404;
    return post;
  }
  @Get('/:id/comments')
  async getCommentByCommendIdInPosts(
    @Body() userFind: WithId<UserMongoDbType>,
    @Query() query: QueryType,
    @Param('id') id: string,
  ) {
    const filter = queryFilter(query);
    const result = await this.commentsRepository.getCommentsInPost(
      id,
      filter,
      userFind._id.toString(),
    );
    if (!result) {
      return HTTP_STATUS.NOT_FOUND_404;
    }
    return result;
  }
  @Post('/:id')
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

    if (!result) return HTTP_STATUS.NOT_FOUND_404;

    return result;
  }
  @Post()
  async createNewPost(
    @Body() postInputModel: BodyPostToRequest,
    @Body() userFind: WithId<UserMongoDbType>,
    @Body() blogId: string,
  ) {
    const user = userFind;
    const postBody = {
      title: postInputModel.title,
      shortDescription: postInputModel.shortDescription,
      content: postInputModel.content,
    };
    if (!user) {
      return this.postsService.createNewPosts(postBody, blogId, null);
    }
    return this.postsService.createNewPosts(
      postBody,
      blogId,
      user._id.toString(),
    );
  }
  @Put(':id')
  async updatePostByPostId(
    @Param('id') userId: string,
    @Body() postInputModel: BodyPostToRequest,
    @Body() id: string,
  ) {
    const result = await this.postsService.updatePostsById(
      userId,
      postInputModel.title,
      postInputModel.shortDescription,
      postInputModel.content,
      id,
    );
    if (result) {
      return HTTP_STATUS.NO_CONTENT_204;
    } else {
      return HTTP_STATUS.NOT_FOUND_404;
    }
  }
  async appropriationLike(req: Request, res: Response) {
    const value = req.body.user;

    const updateComment = await this.postsService.updateStatusLikeInUser(
      req.params.postId,
      value,
      req.body.likeStatus,
    );

    if (!updateComment) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async deletePostByPostId(req: Request, res: Response) {
    const deleted = await this.postsService.deletePostsById(req.params.id);

    if (!deleted) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }

    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }
}
