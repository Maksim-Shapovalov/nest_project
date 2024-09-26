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
import {
  questionBody,
  requestBodyQuestionToCreate,
} from '../type/question.type';
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
  @HttpCode(201)
  async connectCurrentUser(
    @Body() questionBody: requestBodyQuestionToCreate,
  ): Promise<questionBody> {
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
  @HttpCode(204)
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
  @HttpCode(204)
  async changePublishedStatusToQuestion(
    @Body() body: { published: boolean },
    @Param('id') id: number,
  ) {
    const published = body.published;
    return this.quizGameSuperAdminService.updateQuestionPublished(
      published,
      id,
    );
  }
}
