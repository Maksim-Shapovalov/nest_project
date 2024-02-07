import 'reflect-metadata';
import { injectable } from 'inversify';
import { CommentsService } from './Comments.service';

import { CommentsRepository } from './Comments.repository';

import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { UserMongoDbType } from '../Users/Type/User.type';
import { WithId } from 'mongodb';
import { HTTP_STATUS } from '../app.module';

@injectable()
@Controller('users')
export class CommentsController {
  constructor(
    protected serviceComments: CommentsService,
    protected commentsRepository: CommentsRepository,
  ) {}
  @Get(':id')
  async getCommentsById(
    @Body() userFind: WithId<UserMongoDbType>,
    @Param('id') id: string,
  ) {
    const user = userFind;
    if (!user) {
      const findComments = await this.commentsRepository.getCommentById(
        id,
        null,
      );

      if (!findComments) return HTTP_STATUS.NOT_FOUND_404;
      return findComments;
    }
    const findComments = await this.commentsRepository.getCommentById(
      id,
      user._id.toString(),
    );

    if (!findComments) return HTTP_STATUS.NOT_FOUND_404;

    return findComments;
  }
  @Put(':id')
  async updateCommentByCommentId(
    @Param('id') id: string,
    @Body() userFind: WithId<UserMongoDbType>,
    @Body() content: string,
  ) {
    const user = userFind;
    const comment = await this.commentsRepository.getCommentById(id, null);

    if (comment?.commentatorInfo.userId != user._id.toString())
      return HTTP_STATUS.Forbidden_403;

    const updateComment = await this.serviceComments.updateComment(id, content);

    if (!updateComment) return HTTP_STATUS.NOT_FOUND_404;
    return HTTP_STATUS.NO_CONTENT_204;
  }
  // @Put('id')
  // async appropriationLike(
  //   @Param('id') id: string,
  //   @Body() userFind: WithId<UserMongoDbType>,
  //   @Body() inputLikeStatus: string,
  // ) {
  //   const updateComment = await this.serviceComments.updateStatusLikeInUser(
  //     id,
  //     userFind._id.toString(),
  //     inputLikeStatus,
  //   );
  //
  //   if (!updateComment) return HTTP_STATUS.NOT_FOUND_404;
  //
  //   return HTTP_STATUS.NO_CONTENT_204;
  // }
  @Delete('id')
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

    if (!deletedComment) return HTTP_STATUS.NOT_FOUND_404;

    return HTTP_STATUS.NO_CONTENT_204;
  }
}
