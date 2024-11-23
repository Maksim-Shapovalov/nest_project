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

export class FindActivePairCommand {
  constructor(public userModel: NewestPostLike) {}
}

@Injectable()
export class FindActivePairUseCase {
  constructor(
    protected quizGameRepo: QuizGameTypeOrmRepo,
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
    protected quizGameService: QuizGameService,
  ) {}

  async execute(
    userModel: NewestPostLike,
  ): Promise<ViewModelPairToOutput | false> {
    const now = new Date().toISOString();
    const currentPair = await this.quizGameRepo.findPendingStatusPair(
      userModel.userId,
    );
    if (currentPair === 'Active') return false;
    else if (!currentPair) {
      return await this.createPair(userModel);
    }
    const updateBodyPairConnectSecondUser =
      await this.quizGameRepo.connectSecondUserWithFirstUserRepo(
        userModel,
        now,
      );
    const game = await this.quizGameService.getGameById(currentPair.id);
    if (!game) return await this.createPair(userModel);
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
