import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../QuizGame.TypeOrmRepo';
import { NewestPostLike } from '../../../Users/Type/User.type';
import { ViewModelPairToOutput } from '../../type/QuizGame.type';
import { QuizGameEntityNotPlayerInfo } from '../../entity/QuizGame.entity';

export class GetUnfinishedCurrentGameCommand {
  constructor(public userModel: NewestPostLike) {}
}

@Injectable()
export class GetUnfinishedCurrentGameUseCase {
  constructor(protected quizGameRepo: QuizGameTypeOrmRepo) {}

  async execute(
    userModel: NewestPostLike,
  ): Promise<ViewModelPairToOutput | false> {
    const findPairToCurrentUser =
      await this.quizGameRepo.getUnfinishedCurrentGameRepo(userModel);
    if (!findPairToCurrentUser) return false;
    const findFirstPlayer = await this.quizGameRepo.findPlayerById(
      findPairToCurrentUser.firstPlayerId,
    );
    const findSecondPlayer = await this.quizGameRepo.findPlayerById(
      findPairToCurrentUser.secondPlayerId,
    );
    return QuizGameEntityNotPlayerInfo.getViewModel(
      findPairToCurrentUser,
      findFirstPlayer,
      findSecondPlayer,
    );
  }
}
