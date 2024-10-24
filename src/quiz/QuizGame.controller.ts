import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuizGameService } from './QuizGame.service';
import { AnswerInput, AnswerType, OutputTypePair } from './type/QuizGame.type';
import { BearerGuard, User } from '../auth/guard/authGuard';
import { NewestPostLike } from '../Users/Type/User.type';
import { CustomUUIDValidation } from '../Other/validator.validateUUID';

@Controller('pair-game-quiz/pairs')
export class QuizGameController {
  constructor(
    protected quizGameService: QuizGameService,
    private readonly customUUIDValidation: CustomUUIDValidation,
  ) {}
  @UseGuards(BearerGuard)
  @Get('my-current')
  @HttpCode(200)
  async getUnfinishedCurrentGame(
    @User() userModel: NewestPostLike,
  ): Promise<OutputTypePair> {
    const findUnfinishedGameToCurrentUser: OutputTypePair | false =
      await this.quizGameService.getUnfinishedCurrentGameService(userModel);
    if (!findUnfinishedGameToCurrentUser) throw new NotFoundException();
    return findUnfinishedGameToCurrentUser;
  }
  @UseGuards(BearerGuard)
  @Get(':id')
  @HttpCode(200)
  async getGameById(@Param('id') id: string): Promise<OutputTypePair> {
    if (!id || !this.customUUIDValidation.validate(id))
      throw new NotFoundException();
    const findQuizGameById: OutputTypePair | false =
      await this.quizGameService.getGameById(id);
    if (!findQuizGameById) throw new NotFoundException();
    return findQuizGameById;
  }
  @UseGuards(BearerGuard)
  @Post('connection')
  @HttpCode(200)
  async connectCurrentUser(
    @User() userModel: NewestPostLike,
  ): Promise<OutputTypePair> {
    const findPairWithOneUser: OutputTypePair | false =
      await this.quizGameService.findActivePairInService(userModel);
    if (!findPairWithOneUser) throw new BadRequestException();
    return findPairWithOneUser;
  }

  @UseGuards(BearerGuard)
  @Post('my-current/answers')
  @HttpCode(200)
  async sendAnswer(
    @Body() answer: AnswerInput,
    @User() userModel: NewestPostLike,
  ) {
    const sendAnswer: AnswerType | null =
      await this.quizGameService.sendAnswerService(answer.answer, userModel);
    if (!sendAnswer)
      throw new BadRequestException({
        message: 'number of responses exceeded',
      });
    return sendAnswer;
  }
}
