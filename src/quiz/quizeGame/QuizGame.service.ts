import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from './QuizGame.TypeOrmRepo';
import { QuizGameEntityNotPlayerInfo } from '../entity/QuizGame.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewModelPairToOutput } from '../type/QuizGame.type';

@Injectable()
export class QuizGameService {
  constructor(
    protected quizGameRepo: QuizGameTypeOrmRepo,
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
  ) {}

  async getGameById(id: string): Promise<ViewModelPairToOutput | false> {
    const findGame = await this.quizGameRepo.getGameById(id);
    if (!findGame) return false;
    const findFirstPlayer = await this.quizGameRepo.findPlayerById(
      findGame.firstPlayerId,
    );
    const findSecondPlayer = await this.quizGameRepo.findPlayerById(
      findGame.secondPlayerId,
    );
    return QuizGameEntityNotPlayerInfo.getViewModel(
      findGame,
      findFirstPlayer,
      findSecondPlayer,
    );
  }
  async getStatisticPlayer(playerId: string) {
    const findAllPairByPlayerId =
      await this.quizGameRepo.getAllPairByPlayerId(playerId);
    console.log(findAllPairByPlayerId);
    const quantityPair = findAllPairByPlayerId.length;
    console.log(quantityPair);
    const pairWhereFirstPlayer = findAllPairByPlayerId.filter(
      (p) => p.firstPlayer.userId === playerId,
    );
    const pairWhereSecondPlayer = findAllPairByPlayerId.filter(
      (p) => p.secondPlayer.userId === playerId,
    );
    const sumScoreWhereSecondPlayer = pairWhereSecondPlayer.reduce(
      (acc, pair) => {
        return acc + pair.secondPlayer.score;
      },
      0,
    );
    const sumScoreWhereFirstPlayer = pairWhereFirstPlayer.reduce(
      (acc, pair) => {
        return acc + pair.firstPlayer.score;
      },
      0,
    );

    const winsScoreWhereFirstPlayer = pairWhereFirstPlayer.filter(
      (p) => p.firstPlayer.score > p.secondPlayer.score,
    ).length;
    const winsScoreWhereSecondPlayer = pairWhereSecondPlayer.filter(
      (p) => p.secondPlayer.score > p.firstPlayer.score,
    ).length;
    const loseScoreWhereFirstPlayer = pairWhereFirstPlayer.filter(
      (p) => p.firstPlayer.score < p.secondPlayer.score,
    ).length;
    const loseScoreWhereSecondPlayer = pairWhereSecondPlayer.filter(
      (p) => p.secondPlayer.score < p.firstPlayer.score,
    ).length;
    const drawsScore = findAllPairByPlayerId.filter(
      (p) => p.secondPlayer.score === p.firstPlayer.score,
    ).length;

    const sumScore = sumScoreWhereSecondPlayer + sumScoreWhereFirstPlayer;
    const avgScore =
      quantityPair !== 0 ? (sumScore / quantityPair).toFixed(2) : '0.00';

    const windCount = winsScoreWhereFirstPlayer + winsScoreWhereSecondPlayer;
    const loseCount = loseScoreWhereFirstPlayer + loseScoreWhereSecondPlayer;
    return {
      sumScore: sumScore,
      avgScores: parseFloat(avgScore),
      gamesCount: quantityPair,
      winsCount: windCount,
      lossesCount: loseCount,
      drawsCount: drawsScore,
    };
  }
}
