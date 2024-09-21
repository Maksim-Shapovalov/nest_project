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
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../auth/guard/basic-authGuard';
import { QueryType } from '../../Other/Query.Type';
import { queryFilter } from '../../qurey-repo/query-filter';
import { QuizGameSuperAdminService } from './quizGameSuperAdmin.Service';
import { requestBodyQuestionToCreate } from '../type/question.type';
import { User } from '../../auth/guard/authGuard';
import { OutputTypePair } from '../type/QuizGame.type';

@Controller('sa/quiz')
export class QuizGameControllerSuperAdmin {
  constructor(protected quizGameSuperAdminService: QuizGameSuperAdminService) {}
  @UseGuards(BasicAuthGuard)
  @Get('questions')
  @HttpCode(200)
  async getUnfinishedCurrentGame(@Query() query: QueryType) {
    const filter = queryFilter(query);
    return this.quizGameSuperAdminService.getAllQuestions(filter);
  }
  @UseGuards(BasicAuthGuard)
  @Post('questions')
  @HttpCode(200)
  async connectCurrentUser(
    @User() questionBody: requestBodyQuestionToCreate,
  ): Promise<OutputTypePair> {
    return this.quizGameSuperAdminService.createQuestion(questionBody);
  }

  @UseGuards(BasicAuthGuard)
  @Delete('questions/:id')
  @HttpCode(204)
  async sendAnswer(@Param('id') id: number) {
    const deleteQuestion =
      await this.quizGameSuperAdminService.deleteQuestionById(id);
    if (!deleteQuestion) throw new NotFoundException();
  }
  @UseGuards(BasicAuthGuard)
  @Put('questions/:id')
  @HttpCode(200)
  async ChangeBodyQuestionAndAnswer(
    @Body() questionBody: requestBodyQuestionToCreate,
    @Param('id') id: number,
  ) {
    return this.quizGameSuperAdminService.updateQuestionBodyAndCorrectAnswer(
      questionBody,
      id,
    );
  }
  @UseGuards(BasicAuthGuard)
  @Put('questions/:id/publish')
  @HttpCode(200)
  async changePublishedStatusToQuestion(
    @Body() published: boolean,
    @Param('id') id: number,
  ) {
    return this.quizGameSuperAdminService.updateQuestionPublished(
      published,
      id,
    );
  }
}
