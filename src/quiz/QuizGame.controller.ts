import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
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
    if (findUnfinishedGameToCurrentUser === false)
      throw new NotFoundException();

    return findUnfinishedGameToCurrentUser;
  }
  @UseGuards(BearerGuard)
  @Get(':id')
  @HttpCode(200)
  async getGameById(@Param('id') id: string): Promise<OutputTypePair> {
    if (!id || !this.customUUIDValidation.validate(id))
      throw new BadRequestException();
    const findQuizGameById: OutputTypePair | false | 'end' =
      await this.quizGameService.getGameById(id);
    if (findQuizGameById === 'end') throw new UnauthorizedException();
    if (!findQuizGameById) throw new NotFoundException();
    //ser
    return findQuizGameById;
  }
  @UseGuards(BearerGuard)
  @Post('connection')
  @HttpCode(200)
  async connectCurrentUser(
    @User() userModel: NewestPostLike,
  ): Promise<OutputTypePair> {
    const findPairWithOneUser: OutputTypePair | false | null =
      await this.quizGameService.findActivePairInService(userModel);
    if (findPairWithOneUser === null) throw new UnauthorizedException();
    if (!findPairWithOneUser) throw new ForbiddenException();
    //res
    return findPairWithOneUser;
  }

  @UseGuards(BearerGuard)
  @Post('my-current/answers')
  @HttpCode(200)
  async sendAnswer(
    @Body() answer: AnswerInput,
    @User() userModel: NewestPostLike,
  ) {
    const sendAnswer: AnswerType | false | 'end' =
      await this.quizGameService.sendAnswerService(answer.answer, userModel);
    if (!sendAnswer) throw new ForbiddenException();
    if (sendAnswer === 'end') throw new UnauthorizedException();
    return sendAnswer;
  }
}
