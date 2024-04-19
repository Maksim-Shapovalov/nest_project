import 'reflect-metadata';
import { injectable } from 'inversify';
import { CommentsService } from './Comments.service';

import { CommentsRepository } from './Comments.repository';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NewestPostLike, UserMongoDbType } from '../Users/Type/User.type';
import { WithId } from 'mongodb';
import { HTTP_STATUS } from '../app.module';
import { AuthGuard, BearerGuard, User } from '../auth/guard/authGuard';

@injectable()
@Controller('users')
export class CommentsController {
  constructor(
    protected serviceComments: CommentsService,
    protected commentsRepository: CommentsRepository,
  ) {}
  @UseGuards(BearerGuard)
  @Get(':id')
  async getCommentsById(@Param('id') id: string, @Req() request) {
    const user = request.user as NewestPostLike;
    if (!user) {
      const findComments = await this.commentsRepository.getCommentById(
        id,
        user.userId ? user.userId : null,
      );

      if (!findComments) return HTTP_STATUS.NOT_FOUND_404;
      return findComments;
    }
    const findComments = await this.commentsRepository.getCommentById(
      id,
      user.userId,
    );

    if (!findComments) return HTTP_STATUS.NOT_FOUND_404;

    return findComments;
  }
  @UseGuards(BearerGuard)
  @Put(':id')
  async updateCommentByCommentId(
    @Param('id') id: string,
    @Body() content: string,
    @Req() request,
  ) {
    const user = request.user as NewestPostLike;
    const comment = await this.commentsRepository.getCommentById(
      id,
      user.userId ? user.userId : null,
    );

    if (comment?.commentatorInfo.userId != user.userId)
      return HTTP_STATUS.Forbidden_403;

    const updateComment = await this.serviceComments.updateComment(id, content);

    if (!updateComment) return HTTP_STATUS.NOT_FOUND_404;
    return HTTP_STATUS.NO_CONTENT_204;
  }
  @UseGuards(AuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async appropriationLike(
    @Param('id') id: string,
    @User() userModel: UserMongoDbType,
    @Body() inputLikeStatus: string,
  ) {
    const updateComment = await this.serviceComments.updateStatusLikeInUser(
      id,
      userModel._id.toString(),
      inputLikeStatus,
    );

    if (!updateComment) throw new NotFoundException();

    return HttpCode(204);
  }
  @Delete('id')
  @HttpCode(204)
  async deleteCommentByCommentId(
    @Param('id') id: string,
    @Body() userFind: WithId<UserMongoDbType>,
  ) {
    const user = userFind;
    const comment = await this.commentsRepository.getCommentById(
      id,
      user._id.toString(),
    );

    if (comment?.commentatorInfo.userId != user._id.toString())
      return HTTP_STATUS.Forbidden_403;
    const deletedComment = await this.serviceComments.deletedComment(id);

    if (!deletedComment) throw new NotFoundException();

    return HttpCode(204);
  }
}
