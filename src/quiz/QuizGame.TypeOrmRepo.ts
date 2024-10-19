import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  QuizGameClass,
  QuizGameClass1,
  QuizGameInDB,
  StatusTypeEnumToObject,
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
    protected questionsEntity: QuestionsEntity,
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: QuizGameEntityNotPlayerInfo,
    @InjectRepository(AnswersEntity)
    protected answersEntity: AnswersEntity,
    @InjectRepository(PlayersEntity)
    protected playersEntity: PlayersEntity,

    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async getUnfinishedCurrentGameRepo(userModel: NewestPostLike) {
    const findPair = await this.dataSource
      .query(`SELECT * FROM "query_game_entity" 
    WHERE "firstPlayerId" = ${userModel.userId} AND "firstPlayerLogin" = ${userModel.login} AND "status" = ${StatusTypeEnumToObject.Active}`);
    return findPair[0];
  }
  async getPairGameByPlayerId(
    id: number,
    answer: string,
  ): Promise<updateTypeOfQuestion> {
    const findPair = await this.dataSource.query(
      `SELECT * FROM "quiz_game_entity_not_player_info_entity" 
        WHERE "firstPlayerId" = ${id} OR "secondPlayerId" = ${id}`,
    );
    const findPlayer = await this.findPlayer(id);
    const number = findPlayer.answers.length;
    const newArray = findPair.question.slice(number);
    return this.sendAnswerRepo(answer, findPlayer, newArray);
  }
  async sendAnswerRepo(
    answer: string,
    user: findingPlayer,
    question: QuestionsEntity,
  ): Promise<updateTypeOfQuestion> {
    const findQuestion = await this.dataSource.query(
      `SELECT * FROM "questions_entity" WHERE "body" = ${question.body}`,
    );
    const time = new Date().toISOString();
    if (!question.correctAnswers.includes(answer)) {
      return this.addAnswerToDB(
        findQuestion.id,
        user.id,
        StatusTypeEnumByAnswersToEndpoint.incorrect,
        answer,
        time,
      );
    }
    return this.addAnswerToDB(
      findQuestion.id,
      user.id,
      StatusTypeEnumByAnswersToEndpoint.correct,
      answer,
      time,
    );
  }
  async addAnswerToDB(
    questionId: number,
    playerId: number,
    answerStatus: StatusTypeEnumByAnswersToEndpoint,
    answer: string,
    addedAt: string,
  ): Promise<updateTypeOfQuestion> {
    const findQuizGame = await this.dataSource.query(`
    INSERT INTO public."answers_entity"(
    questionId,playerId, answerStatus, answer, addedAt)
     VALUES(${questionId},
     ${playerId}, answerStatus, ${answer}, ${addedAt}
    `);
    return findQuizGame[0];
  }

  async getGameById(id: number): Promise<QuizGameInDB> {
    const findQuizGame = await this.dataSource.query(
      `SELECT * FROM "quiz_game_entity_not_player_info" WHERE id = ${id}`,
    );
    return findQuizGame[0];
  }
  async findPlayer(id: number): Promise<findingPlayer> {
    const findPlayer = await this.dataSource.query(
      `SELECT * FROM "players_entity" WHERE id = ${id}`,
    );
    return findPlayer[0];
  }
  async findActivePair(): Promise<QuizGameInDB | false> {
    const activePair = await this.dataSource.query(
      `SELECT * FROM "quiz_game_entity_not_player_info" WHERE "status" = '${StatusTypeEnumToObject.PendingSecondPlayer}'`,
    );
    return activePair[0] ? activePair[0] : false;
  }
  async choiceFiveQuestion() {
    const getRandomFiveQuestion = await this.dataSource
      .query(`SELECT * FROM "questions_entity"
        WHERE "published" = true ORDER BY RANDOM() LIMIT 5`);
    return getRandomFiveQuestion[0];
  }
  async createNewPairWithNewSingleUser(
    newPair: QuizGameClass1,
  ): Promise<QuizGameInDB> {
    // const randomId = Math.floor(Math.random() * 1000000);

    const newPairWithSingleUser = await this.dataSource
      .query(`INSERT INTO public."quiz_game_entity_not_player_info"(
        "firstPlayerId",status, "pairCreatedDate", "startGameDate", "finishGameDate")
          VALUES(
           ${newPair.firstPlayerId},
          '${newPair.status}','${newPair.pairCreatedDate}','${newPair.startGameDate}','${newPair.finishGameDate}')
          RETURNING *
          `);

    return newPairWithSingleUser[0];
  }
  async newPlayerOnQuizGame(userModel: NewestPostLike): Promise<PlayersEntity> {
    const newPlayerOnGameQuiz = await this.dataSource
      .query(`INSERT INTO public."players_entity"(
         login, score)
          VALUES(
          '${userModel.login}', 0)
          RETURNING *
          `);
    return newPlayerOnGameQuiz[0];
  }
  async connectSecondUserWithFirstUserRepo(userModel: NewestPostLike) {
    const newPlayerInGame = await this.newPlayerOnQuizGame(userModel);
    const now = new Date();
    const fiveQuestion = await this.choiceFiveQuestion();
    const updatePair = await this.dataSource.query(`
    UPDATE "quiz_game_entity_not_player_info"
    SET "secondPlayerId" = ${newPlayerInGame.id},
    "status" = '${StatusTypeEnumToObject.Active}', "startGameDate" = '${now.toISOString()}', "question" = ARRAY['${fiveQuestion}']
    RETURNING *`);
    return updatePair[0];
  }
}
