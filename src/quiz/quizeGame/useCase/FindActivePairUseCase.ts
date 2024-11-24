import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../QuizGame.TypeOrmRepo';
import {
  ViewModelPairToOutput,
  QuizGameClass3,
  StatusTypeEnum,
} from '../../type/QuizGame.type';
import { QuizGameEntityNotPlayerInfo } from '../../entity/QuizGame.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewestPostLike } from '../../../Users/Type/User.type';
import { QuizGameService } from '../QuizGame.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class FindActivePairCommand {
  constructor(public userModel: NewestPostLike) {}
}

@CommandHandler(FindActivePairCommand)
export class FindActivePairUseCase
  implements ICommandHandler<FindActivePairCommand>
{
  constructor(
    protected quizGameRepo: QuizGameTypeOrmRepo,
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
    protected quizGameService: QuizGameService,
  ) {}

  async execute(
    command: FindActivePairCommand,
    // userModel: NewestPostLike,
  ): Promise<ViewModelPairToOutput | false> {
    const now = new Date().toISOString();
    const currentPair = await this.quizGameRepo.findPendingStatusPair(
      command.userModel.userId,
    );
    if (currentPair === 'Active') return false;
    else if (!currentPair) {
      return await this.createPair(command.userModel);
    }
    const updateBodyPairConnectSecondUser =
      await this.quizGameRepo.connectSecondUserWithFirstUserRepo(
        command.userModel,
        now,
      );
    const game = await this.quizGameService.getGameById(currentPair.id);
    if (!game) return await this.createPair(command.userModel);
    const findFirstPlayer = await this.quizGameRepo.findPlayerById(
      updateBodyPairConnectSecondUser.firstPlayerId,
    );
    const findSecondPlayer = await this.quizGameRepo.findPlayerById(
      updateBodyPairConnectSecondUser.secondPlayerId,
    );
    return QuizGameEntityNotPlayerInfo.getViewModel(
      updateBodyPairConnectSecondUser,
      findFirstPlayer,
      findSecondPlayer,
    );
  }
  private async createPair(
    userModel: NewestPostLike,
  ): Promise<ViewModelPairToOutput> {
    const now = new Date().toISOString();
    const newPlayer = await this.quizGameRepo.newPlayerOnQuizGame(userModel);
    const newActivePair = new QuizGameClass3({
      firstPlayerId: newPlayer.id,
      secondPlayerId: null,
      status: StatusTypeEnum.PendingSecondPlayer,
      pairCreatedDate: now,
      startGameDate: null,
      finishGameDate: null,
    });
    const newPair = await this.quizGameRepo.createNewPairWithNewSingleUser(
      newPlayer,
      newActivePair,
      newPlayer.id,
    );
    await this.quizGameRepo.newPlayerOnQuizGameUpdateInfo(newPlayer, newPair);
    const findFirstPlayer = await this.quizGameRepo.findPlayerById(
      newPair.firstPlayerId,
    );
    const findSecondPlayer = await this.quizGameRepo.findPlayerById(
      newPair.secondPlayerId,
    );
    return QuizGameEntityNotPlayerInfo.getViewModel(
      newPair,
      findFirstPlayer,
      findSecondPlayer,
    );
  }
}
