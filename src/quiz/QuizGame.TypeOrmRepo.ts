import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  OutputTypePair,
  OutputTypePairToGetId,
  QuizGameClass1,
  QuizGameInDB,
  StatusTypeEnum,
  updateTypeOfQuestion,
  updateTypeOfQuestion1,
} from './type/QuizGame.type';
import { NewestPostLike } from '../Users/Type/User.type';
import { findingPlayer, PlayersEntity } from './entity/Players.Entity';
import { QuestionsEntity } from './entity/Questions.Entity';
import {
  AnswersEntity,
  QuizGameEntityNotPlayerInfo,
  StatusTypeEnumByAnswersToEndpoint,
} from './entity/QuizGame.entity';
import { questBodyToOutput, questBodyToOutput1 } from './type/question.type';

@Injectable()
export class QuizGameTypeOrmRepo {
  constructor(
    @InjectRepository(QuestionsEntity)
    protected questionsEntity: Repository<QuestionsEntity>,
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
    @InjectRepository(AnswersEntity)
    protected answersEntity: Repository<AnswersEntity>,
    @InjectRepository(PlayersEntity)
    protected playersEntity: Repository<PlayersEntity>,

    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async getUnfinishedCurrentGameRepo(userModel: NewestPostLike) {
    const pairs = await this.quizGameEntityNotPlayerInfo.find({
      where: {
        status: In([StatusTypeEnum.Active, StatusTypeEnum.PendingSecondPlayer]),
      },
      relations: {
        question: true,
      },
    });
    const findPair = pairs.find(
      (pair) =>
        pair.firstPlayerId === userModel.userId ||
        pair.secondPlayerId === userModel.userId,
    );
    if (!findPair || findPair.status === StatusTypeEnum.Finished) return false;
    return findPair;
  }
  async updateAnswerToPlayerIdInGame(
    id: string,
    answer: string,
  ): Promise<updateTypeOfQuestion1 | false | string> {
    const now = new Date().toISOString();
    // await this.endGameAndCountingScore1(id);
    const findPair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: [
        {
          firstPlayerId: id,
          status: StatusTypeEnum.Active,
        },
        {
          secondPlayerId: id,
          status: StatusTypeEnum.Active,
        },
      ],
      relations: ['question'],
    });
    if (!findPair) return false;
    switch (findPair.status) {
      case StatusTypeEnum.PendingSecondPlayer:
        return 'await';
      case StatusTypeEnum.Finished:
        return 'end';
      default:
        break;
    }
    // if (findPair_0.status === StatusTypeEnum.PendingSecondPlayer)
    //   return 'await';
    // if (findPair_0.status === StatusTypeEnum.Finished) return 'end';
    const findPlayer_0 = await this.findPlayer(id);
    const numberOfResponse = findPlayer_0.answers.length;
    if (numberOfResponse === 5) {
      const verifyAnswerTwoPlayer =
        await this.endGameAndCountingScore(findPlayer_0);
      if (!verifyAnswerTwoPlayer) return false;
    }
    // if (numberOfResponse > 5) {
    //   await this.endGameAndCountingScore(findPlayer_0);
    //   return false;
    // }
    const num = findPair.question.slice(numberOfResponse)[0];
    if (!num) return false;
    const findQuestion = await this.questionsEntity.findOne({
      where: { id: num.id },
    });
    const addAnswer = await this.answersEntity.create({
      questionId: num.id,
      answer: answer,
      addedAt: now,
      answerStatus: findQuestion.correctAnswers.includes(answer)
        ? StatusTypeEnumByAnswersToEndpoint.correct
        : StatusTypeEnumByAnswersToEndpoint.incorrect,
      playerId: findPlayer_0.id,
    });
    const savedAnswer = await this.answersEntity.save(addAnswer);
    const scoreChange = findQuestion.correctAnswers.includes(answer) ? 1 : 0;
    await this.changeScoreToPlayer(scoreChange, findPlayer_0.id, savedAnswer);
    const findPlayer = await this.findPlayer(id);
    console.log(findPlayer.answers.length, 'findPlayer.answers.length');
    if (findPlayer.answers.length === 5) {
      const verifyAnswerTwoPlayer =
        await this.endGameAndCountingScore(findPlayer_0);
      console.log(verifyAnswerTwoPlayer, 'verifyAnswerTwoPlayer-------------');
      if (!verifyAnswerTwoPlayer) return false;
    }
    return this.answersEntity.findOne({
      where: { id: savedAnswer.id },
    });
  }
  async changeScoreToPlayer(
    point: number,
    idPlayer: string,
    addAnswer: AnswersEntity,
  ) {
    const player = await this.playersEntity.findOne({
      where: { id: idPlayer },
      relations: ['answers'],
    });
    player.score = player.score + point;
    player.answers.push(addAnswer);
    await this.playersEntity.save(player);
    const findPlayer = await this.playersEntity.findOne({
      where: { id: idPlayer },
      relations: ['answers'],
    });

    return findPlayer;
  }
  async getGameById(id: string): Promise<OutputTypePairToGetId | false> {
    const findPair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: {
        id: id,
      },
      relations: ['question'],
    });
    if (!findPair) return false;
    return findPair;
  }
  async findPlayer(id: string): Promise<findingPlayer | null> {
    return this.playersEntity.findOne({
      where: { id: id },
      relations: {
        answers: true,
      },
    });
  }
  async findActivePair(
    userId: string,
  ): Promise<QuizGameEntityNotPlayerInfo | false | 'Active'> {
    const activePairs = await this.quizGameEntityNotPlayerInfo.find({
      where: [
        { status: StatusTypeEnum.Active },
        { status: StatusTypeEnum.PendingSecondPlayer },
      ],
    });

    const userPairs = activePairs.map((pair) => {
      return {
        pair,
        isUserInPair:
          pair.firstPlayerId === userId || pair.secondPlayerId === userId,
      };
    });
    if (userPairs.length > 0 && userPairs[0].isUserInPair) return 'Active';
    const activePair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: { status: StatusTypeEnum.PendingSecondPlayer },
    });
    return activePair ? activePair : false;
  }

  async endGameAndCountingScore(player: findingPlayer) {
    const now = new Date().toISOString();
    const findPair_0 = await this.quizGameEntityNotPlayerInfo.findOne({
      where: [{ firstPlayerId: player.id }, { secondPlayerId: player.id }],
    });
    const findPlayer1 = await this.findPlayer(findPair_0.firstPlayerId);
    const findPlayer2 = await this.findPlayer(findPair_0.secondPlayerId);
    if (findPlayer1.answers.length === 5 && findPlayer2.answers.length === 5) {
      findPair_0.finishGameDate = now;
      findPair_0.status = StatusTypeEnum.Finished;
      await this.quizGameEntityNotPlayerInfo.save(findPair_0);
      return findPair_0;
    } else if (
      findPlayer1.answers.length === 5 &&
      findPlayer2.answers.length != 5
    ) {
      return true;
    } else if (
      findPlayer1.answers.length != 5 &&
      findPlayer2.answers.length === 5
    ) {
      return true;
    }
    return false;
  }

  async createNewPairWithNewSingleUser(
    newPlayer: PlayersEntity,
    newPair: QuizGameClass1,
    newPlayerId: string,
  ): Promise<QuizGameInDB> {
    // const randomId = Math.floor(Math.random() * 1000000);

    const newPairWithSingleUser = await this.quizGameEntityNotPlayerInfo.create(
      {
        firstPlayer: newPlayer,
        firstPlayerId: newPlayerId,
        status: newPair.status,
        pairCreatedDate: newPair.pairCreatedDate,
        startGameDate: newPair.startGameDate,
        finishGameDate: newPair.finishGameDate,
        question: null,
      },
    );

    const savePair = await this.quizGameEntityNotPlayerInfo.save(
      newPairWithSingleUser,
    );
    return this.quizGameEntityNotPlayerInfo.findOne({
      where: { id: savePair.id },
      relations: {
        question: true,
      },
    });
  }

  async connectSecondUserWithFirstUserRepo(
    userModel: NewestPostLike,
    now: string,
  ) {
    await this.deleteAnswerPlayer(userModel.userId);
    const findActivePair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: {
        secondPlayerId: null,
        status: StatusTypeEnum.PendingSecondPlayer,
      },
    });
    const newPlayerInGame = await this.newPlayerOnQuizGame(userModel);
    await this.playersEntity.update(newPlayerInGame.id, {
      game: findActivePair,
    });
    await this.quizGameEntityNotPlayerInfo.update(findActivePair.id, {
      secondPlayer: newPlayerInGame,
      secondPlayerId: newPlayerInGame.id,
      status: StatusTypeEnum.Active,
      startGameDate: now,
    });

    return this.quizGameEntityNotPlayerInfo.findOne({
      where: { id: findActivePair.id },
      relations: {
        secondPlayer: true,
      },
    });
  }

  async newPlayerOnQuizGame(userModel: NewestPostLike): Promise<PlayersEntity> {
    const newPlayerOnGameQuiz = await this.playersEntity.create({
      id: userModel.userId,
      login: userModel.login,
      score: 0,
    });
    return this.playersEntity.save(newPlayerOnGameQuiz);
  }
  async newPlayerOnQuizGameUpdateInfo(
    userModel: PlayersEntity,
    quizGame: QuizGameInDB,
  ): Promise<boolean> {
    const updatedGame = await this.quizGameEntityNotPlayerInfo.findOne({
      where: { id: quizGame.id },
    });
    await this.playersEntity.update(userModel.id, {
      game: updatedGame,
    });
    return true;
  }
  async deleteAnswerPlayer(playerId: string): Promise<boolean> {
    const findPlayer = await this.playersEntity.findOne({
      where: { id: playerId },
    });
    await this.answersEntity.delete({
      playerId: playerId,
    });
    if (!findPlayer) return true;
    findPlayer.answers = [];
    await this.playersEntity.save(findPlayer);
    return true;
  }

  async choiceFiveQuestion(gameId: string) {
    const getRandomFiveQuestion = await this.dataSource
      .query(`SELECT * FROM "questions_entity"
        WHERE "published" = true ORDER BY RANDOM() LIMIT 5`);
    const questions = getRandomFiveQuestion.map((q) => ({
      id: q.id,
      body: q.body,
    }));
    const game = await this.quizGameEntityNotPlayerInfo.findOne({
      where: { id: gameId },
      relations: ['question'],
    });
    if (!game) {
      throw new Error('Game not found');
    }

    game.question = questions;
    await this.quizGameEntityNotPlayerInfo.save(game);
    return questions;
  }
}
