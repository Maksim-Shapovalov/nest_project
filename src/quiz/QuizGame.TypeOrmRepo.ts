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
    return this.quizGameEntityNotPlayerInfo.findOne({
      where: {
        firstPlayerId: userModel.userId,
        status: In([StatusTypeEnum.Active, StatusTypeEnum.PendingSecondPlayer]),
      },
      relations: {
        question: true,
      },
    });
    // return findPair;
  }
  async updateAnswerToPlayerIdInGame(
    id: string,
    answer: string,
  ): Promise<updateTypeOfQuestion1 | false | 'end'> {
    const now = new Date().toISOString();
    const findPair_0 = await this.quizGameEntityNotPlayerInfo.findOne({
      where: [{ firstPlayerId: id }, { secondPlayerId: id }],
      relations: ['question'],
    });
    if (!findPair_0) return false;
    if (findPair_0.status === StatusTypeEnum.Finished) return 'end';
    const findPlayer_0 = await this.findPlayer(id);
    const numberOfResponse = findPlayer_0.answers.length;
    if (numberOfResponse >= 5) {
      await this.endGameAndCountingScore(findPlayer_0);
      return false;
    }
    const num = findPair_0.question.slice(findPlayer_0.answers.length)[0];
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
  async getGameById(id: string): Promise<OutputTypePairToGetId> {
    return this.quizGameEntityNotPlayerInfo.findOne({
      where: {
        id: id,
      },
      relations: ['question'],
    });
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
      where: { status: StatusTypeEnum.Active },
    });
    const userPairs = activePairs.map((pair) => {
      return {
        pair,
        isUserInPair:
          pair.firstPlayerId === userId || pair.secondPlayerId === userId,
      };
    });
    if (userPairs.length > 0) return 'Active';
    const activePair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: { status: StatusTypeEnum.PendingSecondPlayer },
    });
    return activePair ? activePair : false;
  }

  async endGameAndCountingScore(player: findingPlayer) {
    const findPair_0 = await this.quizGameEntityNotPlayerInfo.findOne({
      where: [{ firstPlayerId: player.id, secondPlayerId: player.id }],
      relations: ['question'],
    });
    const now = new Date().toISOString();
    if (
      findPair_0.secondPlayer.answers.length >= 5 &&
      findPair_0.firstPlayer.answers.length >= 5
    ) {
      findPair_0.finishGameDate = now;
      findPair_0.status = StatusTypeEnum.Finished;
      await this.quizGameEntityNotPlayerInfo.save(findPair_0);
    }
    return true;
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

    return this.quizGameEntityNotPlayerInfo.save(newPairWithSingleUser);
  }

  async connectSecondUserWithFirstUserRepo(userModel: NewestPostLike) {
    const findActivePair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: {
        secondPlayerId: null,
        status: StatusTypeEnum.PendingSecondPlayer,
      },
    });
    const newPlayerInGame = await this.newPlayerOnQuizGame(userModel);
    const now = new Date();
    await this.playersEntity.update(newPlayerInGame.id, {
      game: findActivePair,
    });
    await this.quizGameEntityNotPlayerInfo.update(findActivePair.id, {
      secondPlayer: newPlayerInGame,
      secondPlayerId: newPlayerInGame.id,
      status: StatusTypeEnum.Active,
      startGameDate: now.toISOString(),
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
