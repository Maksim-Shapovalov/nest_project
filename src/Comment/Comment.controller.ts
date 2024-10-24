import { CommentsService } from './Comments.service';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NewestPostLike } from '../Users/Type/User.type';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '../app.module';
import { BearerGuard, User } from '../auth/guard/authGuard';
import { StatusLikes } from '../Posts/Type/Posts.type';
import { SoftAuthGuard } from '../auth/guard/softAuthGuard';
import { BearerAuthGuard } from '../auth/guard/bearer-authGuard';
import { ContentClass } from '../Posts/Posts.controller';
import { CommentSqlTypeOrmRepository } from './TypeOrm/Comments.repo.TypeOrm';
import { CustomUUIDValidation } from '../Other/validator.validateUUID';

@Controller('comments')
export class CommentsController {
  constructor(
    protected serviceComments: CommentsService,
    protected commentsSQLRepository: CommentSqlTypeOrmRepository,
    private readonly customUUIDValidation: CustomUUIDValidation,
  ) {}
  @UseGuards(SoftAuthGuard)
  @Get(':id')
  async getCommentsById(@Param('id') id: string, @Req() request) {
    const user = request.user as NewestPostLike;
    if (!id) throw new NotFoundException();
    const findComments = await this.commentsSQLRepository.getCommentById(
      id,
      user || null,
    );

    if (!findComments) throw new NotFoundException();
    return findComments;
  }
  @UseGuards(BearerGuard)
  @Put(':id')
  @HttpCode(204)
  async updateCommentByCommentId(
    @Param('id') id: string,
    @Body() content: ContentClass,
    @Req() request,
  ) {
    if (!this.customUUIDValidation.validate(id)) throw new NotFoundException();
    const user = request.user as NewestPostLike;
    if (!user) throw new NotFoundException();
    const comment = await this.commentsSQLRepository.getCommentById(id, user);
    if (!comment) throw new NotFoundException();

    if (comment.commentatorInfo.userId !== user.userId.toString())
      throw new ForbiddenException();

    const updateComment = await this.serviceComments.updateComment(
      id,
      content.content,
    );

    if (!updateComment) throw new NotFoundException();
    return HTTP_STATUS.NO_CONTENT_204;
  }
  @UseGuards(BearerAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async appropriationLike(
    @Param('id') id: string,
    @Body() inputLikeStatus: StatusLikes,
    @User() userModel: NewestPostLike,
  ) {
    const findComments = await this.commentsSQLRepository.getCommentById(
      id,
      userModel,
    );
    if (!findComments) throw new NotFoundException();
    const updateComment = await this.serviceComments.updateStatusLikeInUser(
      id,
      userModel.userId,
      inputLikeStatus.likeStatus,
    );

    if (!updateComment) throw new NotFoundException();

    return HttpCode(204);
  }
  @UseGuards(BearerGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteCommentByCommentId(@Param('id') id: string, @Req() request) {
    const user = request.user as NewestPostLike;
    if (!id) throw new NotFoundException();
    const comment = await this.commentsSQLRepository.getCommentById(
      id,
      user || null,
    );
    if (!comment) throw new NotFoundException();

    if (comment.commentatorInfo.userId !== user.userId.toString())
      throw new ForbiddenException();
    const deletedComment = await this.serviceComments.deletedComment(id);

    if (!deletedComment) throw new NotFoundException();
  }
}
