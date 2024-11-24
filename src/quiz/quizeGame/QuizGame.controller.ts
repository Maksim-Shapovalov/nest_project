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
import {
  AnswerInput,
  AnswerType,
  ViewModelPairToOutput,
} from '../type/QuizGame.type';
import { BearerGuard, User } from '../../auth/guard/authGuard';
import { NewestPostLike } from '../../Users/Type/User.type';
import { GameUserGuard } from '../validatorToQuizGame/quizeGame.validator';
import {
  QueryTypeToQuizGame,
  QueryTypeToTopPlayers,
} from '../../Other/Query.Type';
import {
  queryFilterByQuizGame,
  queryFilterByTopPlayer,
} from '../../qurey-repo/query-filter';
import { FindActivePairCommand } from './useCase/FindActivePairUseCase';
import { SendAnswerCommand } from './useCase/SendAnswerUseCase';
import { CommandBus } from '@nestjs/cqrs';
import { GetHistoryGameByPlayerCommand } from './useCase/GetHistoryGameByPlayerUseCase';
import { GetTopPlayersCommand } from './useCase/GetTopPlayersUseCase';
import { GetUnfinishedCurrentGameCommand } from './useCase/GetUnfinishedCurrentGameUseCase';

@Controller('pair-game-quiz')
export class QuizGameController {
  constructor(
    private commandBus: CommandBus,
    protected quizGameService: QuizGameService,
  ) {}

  @Get('users/top')
  @HttpCode(200)
  async getTopPlayer(@Query() query: QueryTypeToTopPlayers) {
    console.log(query, 'query');
    const filter = queryFilterByTopPlayer(query);
    console.log(filter, 'filter-----------');
    return this.commandBus.execute(new GetTopPlayersCommand(filter));
  }
  @UseGuards(BearerGuard)
  @Get('pairs/my')
  @HttpCode(200)
  async getHistoryPlayer(
    @User() userModel: NewestPostLike,
    @Query() query: QueryTypeToQuizGame,
  ) {
    const filter = queryFilterByQuizGame(query);
    return this.commandBus.execute(
      new GetHistoryGameByPlayerCommand(userModel, filter),
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
  ): Promise<ViewModelPairToOutput> {
    const findUnfinishedGameToCurrentUser: ViewModelPairToOutput | false =
      await this.commandBus.execute(
        new GetUnfinishedCurrentGameCommand(userModel),
      );
    if (findUnfinishedGameToCurrentUser === false)
      throw new NotFoundException();

    return findUnfinishedGameToCurrentUser;
  }
  @UseGuards(BearerGuard, GameUserGuard)
  @Get('pairs/:id')
  @HttpCode(200)
  async getGameById(@Param('id') id: string): Promise<ViewModelPairToOutput> {
    const findQuizGameById: ViewModelPairToOutput | false =
      await this.quizGameService.getGameById(id);
    if (!findQuizGameById) throw new NotFoundException();
    return findQuizGameById;
  }
  @UseGuards(BearerGuard)
  @Post('pairs/connection')
  @HttpCode(200)
  async connectCurrentUser(
    @User() userModel: NewestPostLike,
  ): Promise<ViewModelPairToOutput> {
    const findPairWithOneUser: ViewModelPairToOutput | false =
      await this.commandBus.execute(new FindActivePairCommand(userModel));
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
      await this.commandBus.execute(
        new SendAnswerCommand(answer.answer, userModel),
      );
    if (!sendAnswer) throw new ForbiddenException();
    return sendAnswer;
  }
}
