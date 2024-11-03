import {
  Body,
  Controller,
  ForbiddenException,
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
import { GameUserGuard } from './validatorToQuizGame/quizeGame.validator';

@Controller('pair-game-quiz/pairs')
export class QuizGameController {
  constructor(protected quizGameService: QuizGameService) {}
  @UseGuards(BearerGuard)
  @Get('my-current')
  @HttpCode(200)
  async getUnfinishedCurrentGame(
    @User() userModel: NewestPostLike,
  ): Promise<OutputTypePair> {
    const findUnfinishedGameToCurrentUser: OutputTypePair | false =
      await this.quizGameService.getUnfinishedCurrentGameService(userModel);
    if (findUnfinishedGameToCurrentUser === false)
      throw new NotFoundException();

    return findUnfinishedGameToCurrentUser;
  }
  @UseGuards(BearerGuard, GameUserGuard)
  @Get(':id')
  @HttpCode(200)
  async getGameById(@Param('id') id: string): Promise<OutputTypePair> {
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
    if (!findPairWithOneUser) throw new ForbiddenException();
    return findPairWithOneUser;
  }

  @UseGuards(BearerGuard)
  @Post('my-current/answers')
  @HttpCode(200)
  async sendAnswer(
    @Body() answer: AnswerInput,
    @User() userModel: NewestPostLike,
  ) {
    const sendAnswer: AnswerType | false | string =
      await this.quizGameService.sendAnswerService(answer.answer, userModel);
    if (!sendAnswer) throw new ForbiddenException();
    return sendAnswer;
    // if (!sendAnswer || sendAnswer === 'await') throw new ForbiddenException();
    // if (sendAnswer === 'end') throw new UnauthorizedException();
    // return sendAnswer;
  }
}
