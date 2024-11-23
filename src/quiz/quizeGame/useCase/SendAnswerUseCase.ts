import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../QuizGame.TypeOrmRepo';
import { AnswerType, updateTypeOfQuestion1 } from '../../type/QuizGame.type';
import { QuizGameEntityNotPlayerInfo } from '../../entity/QuizGame.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewestPostLike } from '../../../Users/Type/User.type';

export class SendAnswerCommand {
  constructor(
    public answer: string,
    public user: NewestPostLike,
  ) {}
}
@Injectable()
export class SendAnswerUseCase {
  constructor(
    protected quizGameRepo: QuizGameTypeOrmRepo,
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
  ) {}

  async execute(
    answer: string,
    user: NewestPostLike,
  ): Promise<AnswerType | false> {
    const findPlayerInGame: updateTypeOfQuestion1 | false =
      await this.quizGameRepo.updateAnswerToPlayerIdInGame(user.userId, answer);
    return findPlayerInGame ? findPlayerInGame : false;
  }
}
