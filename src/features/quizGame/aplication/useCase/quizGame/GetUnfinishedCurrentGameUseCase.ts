import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../../../infrastrucrue/QuizGame.TypeOrmRepo';
import { NewestPostLike } from '../../../../users/domain/User.type';
import { ViewModelPairToOutput } from '../../../domain/type/QuizGame.type';
import { QuizGameEntityNotPlayerInfo } from '../../../domain/QuizGame.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetUnfinishedCurrentGameCommand {
  constructor(public userModel: NewestPostLike) {}
}

@CommandHandler(GetUnfinishedCurrentGameCommand)
export class GetUnfinishedCurrentGameUseCase
  implements ICommandHandler<GetUnfinishedCurrentGameCommand>
{
  constructor(protected quizGameRepo: QuizGameTypeOrmRepo) {}

  async execute(
    command: GetUnfinishedCurrentGameCommand,
  ): Promise<ViewModelPairToOutput | false> {
    const findPairToCurrentUser =
      await this.quizGameRepo.getUnfinishedCurrentGameRepo(command.userModel);
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
