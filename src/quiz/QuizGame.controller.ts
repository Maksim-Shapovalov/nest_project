import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuizGameService } from './QuizGame.service';
import { AnswerInput, AnswerType, OutputTypePair } from './type/QuizGame.type';
import { BearerGuard, User } from '../auth/guard/authGuard';
import { NewestPostLike } from '../Users/Type/User.type';
import { GameUserGuard } from './validatorToQuizGame/quizeGame.validator';
import { QueryTypeToQuizGame } from '../Other/Query.Type';
import { queryFilterByQuizGame1 } from '../qurey-repo/query-filter';

@Controller('pair-game-quiz')
export class QuizGameController {
  constructor(protected quizGameService: QuizGameService) {}

  // @Get('users/top')
  // @HttpCode(200)
  // async getTopPlayer(@Query() query: QueryTypeToTopPlayers) {
  //   return topPlayers;
  // }
  @UseGuards(BearerGuard)
  @Get('pairs/my')
  @HttpCode(200)
  async getHistoryPlayer(
    @User() userModel: NewestPostLike,
    @Query() query: QueryTypeToQuizGame,
  ) {
    const filter = queryFilterByQuizGame1(query);
    return this.quizGameService.getHistoryGameByPlayerService(
      userModel,
      filter,
    );
  }
  @UseGuards(BearerGuard)
  @Get('users/my-statistic')
  @HttpCode(200)
  async getStatisticPlayer(@User() userModel: NewestPostLike) {
    return this.quizGameService.getStatisticPlayer(userModel.userId);
  }
  @UseGuards(BearerGuard)
  @Get('pairs/my-current')
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
  @Get('pairs/:id')
  @HttpCode(200)
  async getGameById(@Param('id') id: string): Promise<OutputTypePair> {
    const findQuizGameById: OutputTypePair | false =
      await this.quizGameService.getGameById(id);
    if (!findQuizGameById) throw new NotFoundException();
    return findQuizGameById;
  }
  @UseGuards(BearerGuard)
  @Post('pairs/connection')
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
  @Post('pairs/my-current/answers')
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
