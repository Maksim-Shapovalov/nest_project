import {
  BadRequestException,
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
import { BasicAuthGuard } from '../../../core/guard/basic-authGuard';
import { QueryType } from '../../validate-middleware/Query.Type';
import { queryFilter } from '../../validate-middleware/query-filter';
import { QuizGameSuperAdminService } from '../aplication/quizGameSuperAdmin.Service';
import {
  PublishType,
  questionBody,
  requestBodyQuestionToCreate,
} from '../domain/type/question.type';
import { CustomUUIDValidation } from '../../../core/decorators/validator.validateUUID';

@Controller('sa/quiz/')
export class QuizGameControllerSuperAdmin {
  constructor(
    protected quizGameSuperAdminService: QuizGameSuperAdminService,
    private readonly customUUIDValidation: CustomUUIDValidation,
  ) {}
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
  async sendAnswer(@Param('id') id: string) {
    if (!id || typeof id !== 'string') throw new NotFoundException();
    const deleteQuestion =
      await this.quizGameSuperAdminService.deleteQuestionById(+id);
    if (!deleteQuestion) throw new NotFoundException();
  }
  @UseGuards(BasicAuthGuard)
  @Put('questions/:id')
  @HttpCode(204)
  async ChangeBodyQuestionAndAnswer(
    @Body() questionBody: requestBodyQuestionToCreate,
    @Param('id') id: string,
  ) {
    if (!id || typeof id !== 'string') throw new NotFoundException();
    const findQuest =
      await this.quizGameSuperAdminService.updateQuestionBodyAndCorrectAnswer(
        questionBody,
        +id,
      );
    if (!findQuest) throw new NotFoundException();
  }
  @UseGuards(BasicAuthGuard)
  @Put('questions/:id/publish')
  @HttpCode(204)
  async changePublishedStatusToQuestion(
    @Body() body: PublishType,
    @Param('id') id: string,
  ) {
    if (!id || typeof id !== 'string') throw new NotFoundException();
    const findQuest =
      await this.quizGameSuperAdminService.updateQuestionPublished(
        body.published,
        +id,
      );
    if (!findQuest) throw new NotFoundException();
  }
}
