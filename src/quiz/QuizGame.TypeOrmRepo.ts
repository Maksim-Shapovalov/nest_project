import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  OutputTypePair,
  OutputTypePairToGetId,
  QuizGameClass1,
  QuizGameInDB,
  StatusTypeEnum,
  updateTypeOfQuestion,
} from './type/QuizGame.type';
import { NewestPostLike } from '../Users/Type/User.type';
import { findingPlayer, PlayersEntity } from './entity/Players.Entity';
import { QuestionsEntity } from './entity/Questions.Entity';
import {
  AnswersEntity,
  QuizGameEntityNotPlayerInfo,
  StatusTypeEnumByAnswersToEndpoint,
} from './entity/QuizGame.entity';

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
        status: StatusTypeEnum.Active,
      },
    });
    // return findPair;
  }
  async getPairGameByPlayerId(
    id: number,
    answer: string,
  ): Promise<updateTypeOfQuestion> {
    const now = new Date().toISOString();
    const findPair_0 = await this.quizGameEntityNotPlayerInfo.findOne({
      where: [{ firstPlayerId: id, secondPlayerId: id }],
    });
    const findPlayer_0 = await this.findPlayer(id);
    const num = findPair_0.question.slice(findPlayer_0.answers.length)[0];
    const findQuestion = await this.questionsEntity.findOne({
      where: { id: num.id },
    });
    if (findQuestion.correctAnswers.includes(answer)) {
      const addAnswer = await this.answersEntity.create({
        question: num,
        player: findPlayer_0,
        answer: answer,
        answerStatus: StatusTypeEnumByAnswersToEndpoint.correct,
        addedAt: now,
      });
      await this.changeScoreToPlayer(1, findPlayer_0.id);
      return this.answersEntity.save(addAnswer);
    } else if (!findQuestion.correctAnswers.includes(answer)) {
      const addAnswer = await this.answersEntity.create({
        question: num,
        player: findPlayer_0,
        answer: answer,
        answerStatus: StatusTypeEnumByAnswersToEndpoint.incorrect,
        addedAt: now,
      });
      await this.changeScoreToPlayer(0, findPlayer_0.id);
      return this.answersEntity.save(addAnswer);
    }
    // const addAnswer = await this.answersEntity.create({
    //   question: num,
    //   player: findPlayer_0,
    //   answer: answer,
    //   answerStatus: StatusTypeEnumByAnswersToEndpoint.incorrect
    //   addedAt:
    // });

    // const findPair = await this.quizGameEntityNotPlayerInfo.findOne({
    //   where: [{ firstPlayerId: id, secondPlayerId: id }],
    // });
    // const findPlayer = await this.findPlayer(id);
    // // const findPlayerEntity = await this.findPlayerEntity(id);
    // const number = findPlayer.answers.length;
    // await this.playersEntity.update(findPlayer.id, {
    //   answers: answer,
    // });
    // const newArray = findPair.question.slice(number);
    // // const newArrays = await this.
    // return this.sendAnswerRepo(answer, findPlayerEntity, newArray);
  }
  async changeScoreToPlayer(point: number, idPlayer: number) {
    const player = await this.playersEntity.findOne({
      where: { id: idPlayer },
    });
    const newScore = player.score + point;
    await this.playersEntity.update(idPlayer, {
      score: newScore,
    });
  }
  // async sendAnswerRepo(
  //   answer: string,
  //   user: PlayersEntity,
  //   question: QuestionsEntity,
  // ): Promise<updateTypeOfQuestion> {
  //   const findQuestion = await this.questionsEntity.findOne({
  //     where: { body: question.body },
  //   });
  //   const time = new Date().toISOString();
  //   if (!question.correctAnswers.includes(answer)) {
  //     return this.addAnswerToDB(
  //       findQuestion,
  //       user,
  //       StatusTypeEnumByAnswersToEndpoint.incorrect,
  //       answer,
  //       time,
  //     );
  //   }
  //   return this.addAnswerToDB(
  //     findQuestion,
  //     user,
  //     StatusTypeEnumByAnswersToEndpoint.correct,
  //     answer,
  //     time,
  //   );
  // }
  // async addAnswerToDB(
  //   question: QuestionsEntity,
  //   player: PlayersEntity,
  //   answerStatus: StatusTypeEnumByAnswersToEndpoint,
  //   answer: string,
  //   addedAt: string,
  // ): Promise<updateTypeOfQuestion> {
  //   const findQuizGame = await this.answersEntity.create({
  //     question: question,
  //     player: player,
  //     answerStatus: answerStatus,
  //     answer: answer,
  //     addedAt: addedAt,
  //   });
  //   const saveAnswer = await this.answersEntity.save(findQuizGame);
  //   const result: updateTypeOfQuestion = {
  //     questionId: saveAnswer.question.id,
  //     playerId: saveAnswer.player.id,
  //     answerStatus: StatusTypeEnumByAnswers,
  //     answer: string,
  //     addedAt: string,
  //   };
  // }

  async getGameById(id: number): Promise<OutputTypePairToGetId> {
    return this.quizGameEntityNotPlayerInfo.findOne({
      where: {
        id: id,
      },
      relations: ['question'],
    });

    // this.dataSource.query(
    //   `SELECT * FROM "quiz_game_entity_not_player_info" WHERE id = ${id}`,
    // );
    // return findQuizGame;
  }
  async findPlayer(id: number): Promise<findingPlayer | null> {
    return this.playersEntity.findOne({
      where: { id: id },
      relations: {
        answers: true,
      },
    });
  }
  // async findPlayerEntity(id: number) {
  //   return this.playersEntity.findOne({ where: { id: id } });
  // }
  async findActivePair(): Promise<QuizGameEntityNotPlayerInfo | false> {
    const activePair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: { status: StatusTypeEnum.PendingSecondPlayer },
    });
    return activePair ? activePair : false;
  }

  async createNewPairWithNewSingleUser(
    newPlayer: PlayersEntity,
    newPair: QuizGameClass1,
    newPlayerId: number,
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

    const findUpdatePair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: { id: findActivePair.id },
      relations: {
        secondPlayer: true,
      },
    });
    return findUpdatePair;
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

  async choiceFiveQuestion(gameId: number) {
    const getRandomFiveQuestion = await this.dataSource
      .query(`SELECT * FROM "questions_entity"
        WHERE "published" = true ORDER BY RANDOM() LIMIT 5`);
    const questions = getRandomFiveQuestion.map((q) => ({ id: q.id }));

    const game = await this.quizGameEntityNotPlayerInfo.findOne({
      where: { id: gameId },
      relations: ['question'],
    });

    if (!game) {
      throw new Error('Game not found');
    }

    game.question = questions;
    await this.quizGameEntityNotPlayerInfo.save(game);
    return getRandomFiveQuestion[0];
  }
}
