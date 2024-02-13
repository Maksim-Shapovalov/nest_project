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
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { WithId } from 'mongodb';
import { UserMongoDbType } from '../Users/Type/User.type';
import { QueryType } from '../Other/Query.Type';
import { BodyPostToPut, BodyPostToRequest1 } from './Type/Posts.type';

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
  @Get(':id')
  @HttpCode(200)
  async getPostByPostId(@Param('id') id: string) {
    const post = await this.postsRepository.getPostsById(id);
    if (!post) return HttpCode(404);
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
      return HttpCode(404);
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

    if (!result) return HttpCode(404);

    return result;
  }
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
    if (result) {
      return HttpCode(204);
    } else {
      return HttpCode(404);
    }
  }
  // @Put()
  // async appropriationLike(req: Request, res: Response) {
  //   const value = req.body.user;
  //
  //   const updateComment = await this.postsService.updateStatusLikeInUser(
  //     req.params.postId,
  //     value,
  //     req.body.likeStatus,
  //   );
  //
  //   if (!updateComment) {
  //     res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
  //     return;
  //   }
  //
  //   res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  // }
  @Delete(':id')
  @HttpCode(204)
  async deletePostByPostId(@Param('id') id: string) {
    const deleted = await this.postsService.deletePostsById(id);

    if (!deleted) return HttpCode(404);

    return HttpCode(204);
  }
}
