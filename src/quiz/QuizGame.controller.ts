import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BearerAuthGuard } from '../auth/guard/bearer-authGuard';
import { QuizGameService } from './QuizGame.service';
import { AnswerType, OutputTypePair } from './type/QuizGame.type';
import { BearerGuard, User } from '../auth/guard/authGuard';
import { NewestPostLike } from '../Users/Type/User.type';
import { QuizGameTypeOrmRepo } from './QuizGame.TypeOrmRepo';

@Controller('pair-game-quiz/pairs')
export class QuizGameController {
  constructor(
    protected quizGameService: QuizGameService,
    protected quizGameRepo: QuizGameTypeOrmRepo,
  ) {}
  @UseGuards(BearerGuard)
  @Get('my-current')
  @HttpCode(200)
  async getUnfinishedCurrentGame(@User() userModel: NewestPostLike) {
    const findUnfinishedGameToCurrentUser: OutputTypePair | false =
      await this.quizGameService.getUnfinishedCurrentGameService(userModel);
    if (!findUnfinishedGameToCurrentUser) throw new NotFoundException();
    return findUnfinishedGameToCurrentUser;
  }
  @UseGuards(BearerGuard)
  @Get(':id')
  @HttpCode(200)
  async getGameById(@Param('id') id: number): Promise<OutputTypePair> {
    const findQuizGameById: OutputTypePair | false =
      await this.quizGameService.getGameByIdInService(id);
    if (!findQuizGameById) throw new NotFoundException();
    return findQuizGameById;
  }
  @UseGuards(BearerGuard)
  @Post('connection')
  @HttpCode(200)
  async connectCurrentUser(
    @User() userModel: NewestPostLike,
  ): Promise<OutputTypePair> {
    const findPairWithOneUser: OutputTypePair =
      await this.quizGameService.findActivePairInService(userModel);
    return findPairWithOneUser;
  }

  @UseGuards(BearerGuard)
  @Post('my-current/answers')
  @HttpCode(200)
  async sendAnswer(@Body() answer: string, @User() userModel: NewestPostLike) {
    const sendAnswer: AnswerType = await this.quizGameService.sendAnswerService(
      answer,
      userModel,
    );
    return sendAnswer;
  }
}
