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
import { BearerGuard, User } from '../auth/guard/authGuard';
import { StatusLikes } from '../Posts/Type/Posts.type';
import { SoftAuthGuard } from '../auth/guard/softAuthGuard';

@injectable()
@Controller('comments')
export class CommentsController {
  constructor(
    protected serviceComments: CommentsService,
    protected commentsRepository: CommentsRepository,
  ) {}
  @UseGuards(SoftAuthGuard)
  @Get(':id')
  async getCommentsById(@Param('id') id: string, @Req() request) {
    const user = request.user as NewestPostLike;
    const findComments = await this.commentsRepository.getCommentById(
      id,
      user ? user.userId : null,
    );

    if (!findComments) throw new NotFoundException();
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
  @UseGuards(BearerGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async appropriationLike(
    @Param('id') id: string,
    @Body() inputLikeStatus: StatusLikes,
    @User() userModel: { userId: string },
  ) {
    const updateComment = await this.serviceComments.updateStatusLikeInUser(
      id,
      userModel.userId,
      inputLikeStatus.likeStatus,
    );

    if (!updateComment) throw new NotFoundException();

    return HttpCode(204);
  }
  @UseGuards(BearerGuard)
  @Delete('id')
  @HttpCode(204)
  async deleteCommentByCommentId(
    @Param('id') id: string,
    @Body() userFind: WithId<UserMongoDbType>,
    @Req() request,
  ) {
    const user = request.user as NewestPostLike;
    const comment = await this.commentsRepository.getCommentById(
      id,
      user.userId,
    );

    if (comment?.commentatorInfo.userId != user.userId)
      return HTTP_STATUS.Forbidden_403;
    const deletedComment = await this.serviceComments.deletedComment(id);

    if (!deletedComment) throw new NotFoundException();

    return HttpCode(204);
  }
}
