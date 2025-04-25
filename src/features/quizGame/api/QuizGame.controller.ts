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
import { QuizGameService } from '../aplication/QuizGame.service';
import {
  AnswerInput,
  AnswerType,
  ViewModelPairToOutput,
} from '../domain/type/QuizGame.type';
import { BearerGuard } from '../../../core/guard/authGuard';
import { NewestPostLike } from '../../users/domain/User.type';
import { GameUserGuard } from '../../../core/guard/quizeGame.validator';
import {
  QueryTypeToQuizGame,
  QueryTypeToTopPlayers,
} from '../../validate-middleware/Query.Type';
import {
  queryFilterByQuizGame,
  queryFilterByTopPlayer,
} from '../../validate-middleware/query-filter';
import { FindActivePairCommand } from '../aplication/useCase/quizGame/FindActivePairUseCase';
import { SendAnswerCommand } from '../aplication/useCase/quizGame/SendAnswerUseCase';
import { CommandBus } from '@nestjs/cqrs';
import { GetHistoryGameByPlayerCommand } from '../aplication/useCase/quizGame/GetHistoryGameByPlayerUseCase';
import { GetTopPlayersCommand } from '../aplication/useCase/quizGame/GetTopPlayersUseCase';
import { GetUnfinishedCurrentGameCommand } from '../aplication/useCase/quizGame/GetUnfinishedCurrentGameUseCase';
import { NoMoreFiveAnswersGuard } from '../../../core/guard/NoMoreFiveAnswersGuard';
import {
  Gives10SecondToEndsGameCase,
  Gives10SecondToEndsGameCommand,
} from '../aplication/useCase/quizGame/CronGive10SecondToEndsGame';
import { User } from '../../../core/decorators/user.decorator';

@Controller('pair-game-quiz')
export class QuizGameController {
  constructor(
    private commandBus: CommandBus,
    protected quizGameService: QuizGameService,
    private gives10SecondsToEndsGameCase: Gives10SecondToEndsGameCase,
  ) {}

  @Get('users/top')
  @HttpCode(200)
  async getTopPlayer(@Query() query: QueryTypeToTopPlayers) {
    const filter = queryFilterByTopPlayer(query);
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
  @UseGuards(BearerGuard, NoMoreFiveAnswersGuard)
  @Post('pairs/my-current/answers')
  @HttpCode(200)
  async sendAnswer(
    @Body() answer: AnswerInput,
    @User() userModel: NewestPostLike,
  ) {
    const sendAnswer: AnswerType | false = await this.commandBus.execute(
      new SendAnswerCommand(answer.answer, userModel),
    );
    if (!sendAnswer) throw new ForbiddenException();
    const findPairWherePlayerGiveAnswer: ViewModelPairToOutput | false =
      await this.commandBus.execute(
        new GetUnfinishedCurrentGameCommand(userModel),
      );
    if (
      findPairWherePlayerGiveAnswer &&
      (findPairWherePlayerGiveAnswer.firstPlayerProgress.answers.length === 5 ||
        findPairWherePlayerGiveAnswer.secondPlayerProgress.answers.length === 5)
    ) {
      const executionTime = new Date(
        new Date(sendAnswer.addedAt).getTime() + 7000,
      ).toISOString();
      await this.commandBus.execute(
        new Gives10SecondToEndsGameCommand(
          executionTime,
          findPairWherePlayerGiveAnswer.id,
        ),
      );
    }

    return sendAnswer;
  }
}
