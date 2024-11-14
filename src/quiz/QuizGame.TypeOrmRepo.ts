import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  OutputTypePair,
  OutputTypePairToGetId,
  QuizGameClass1,
  QuizGameInDB,
  StatusTypeEnum,
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
import { PaginationQueryType } from '../qurey-repo/query-filter';

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

  async getHistoryGameByPlayerRepository(
    userModel: NewestPostLike,
    filter: PaginationQueryType,
  ) {
    const pageSizeInQuery: number = filter.pageSize;
    const [pairs, totalCountPair] =
      await this.quizGameEntityNotPlayerInfo.findAndCount({
        where: [
          {
            firstPlayer: { userId: userModel.userId },
            status: In([StatusTypeEnum.Finished, StatusTypeEnum.Active]),
            // status: In([StatusTypeEnum.Finished, StatusTypeEnum.Active]),
          },
          {
            secondPlayer: { userId: userModel.userId },
            status: In([StatusTypeEnum.Finished, StatusTypeEnum.Active]),
            // status: In([StatusTypeEnum.Finished, StatusTypeEnum.Active]),
          },
        ],
        relations: {
          question: true,
        },
        order: {
          [filter.sortBy]: filter.sortDirection,
        },
        take: pageSizeInQuery,
        skip: (filter.pageNumber - 1) * pageSizeInQuery,
      });
    const totalCount = parseInt(totalCountPair.toString());
    const itemsPromises = pairs.map((pair) => this.pairHistoryMapper(pair));
    const items = await Promise.all(itemsPromises);
    return {
      pagesCount: Math.ceil(totalCount / pageSizeInQuery),
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCount,
      items: items,
    };
  }

  async getAllPairByPlayerId(playerId: string) {
    return this.quizGameEntityNotPlayerInfo.find({
      where: [{ firstPlayerId: playerId }, { secondPlayerId: playerId }],
      relations: { firstPlayer: true, secondPlayer: true },
    });
  }
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
  ): Promise<updateTypeOfQuestion1 | false> {
    const now = new Date().toISOString();
    // await this.endGameAndCountingScore1(id);
    const findPair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: [
        {
          firstPlayer: { userId: id },
          status: StatusTypeEnum.Active,
        },
        {
          secondPlayer: { userId: id },
          status: StatusTypeEnum.Active,
        },
      ],
      relations: ['question'],
    });
    if (!findPair) return false;
    const findPlayer_0 = await this.findPlayer(id, findPair.id);
    const numberOfResponse = findPlayer_0.answers.length;

    if (numberOfResponse === 5) {
      const verifyAnswerTwoPlayer =
        await this.endGameAndCountingScore(findPlayer_0);
      if (!verifyAnswerTwoPlayer) return false;
    }
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
    const findPlayer = await this.findPlayer(id, findPair.id);
    if (findPlayer.answers.length === 5) {
      const verifyAnswerTwoPlayer =
        await this.endGameAndCountingScore(findPlayer_0);
      if (!verifyAnswerTwoPlayer) return false;
      if (typeof verifyAnswerTwoPlayer !== 'boolean') {
        await this.addBonusPoint(verifyAnswerTwoPlayer);
      }
    }
    const returnAnswer = await this.answersEntity.findOne({
      where: { id: savedAnswer.id },
    });
    return {
      ...returnAnswer,
      questionId: returnAnswer.questionId.toString(),
    };
  }

  async addBonusPoint(game: QuizGameEntityNotPlayerInfo) {
    const [findPlayerFirst, findPlayerSecond] = await Promise.all([
      this.findPlayerById(game.firstPlayerId),
      this.findPlayerById(game.secondPlayerId),
    ]);
    console.log(
      findPlayerFirst,
      findPlayerSecond,
      '------------------findPlayerFirst, findPlayerSecond',
    );
    const lastAnswerFirstPlayer = findPlayerFirst.answers.at(-1);
    const lastAnswerSecondPlayer = findPlayerSecond.answers.at(-1);
    console.log(
      lastAnswerFirstPlayer,
      lastAnswerSecondPlayer,
      'lastAnswerFirstPlayer, lastAnswerSecondPlayer-----------------',
    );
    const fastestResponder =
      lastAnswerFirstPlayer.addedAt < lastAnswerSecondPlayer.addedAt
        ? findPlayerFirst
        : findPlayerSecond;
    const findCorrectAnswer = fastestResponder.answers.filter(
      (a) => a.answerStatus === StatusTypeEnumByAnswersToEndpoint.correct,
    );
    if (findCorrectAnswer.length > 0) {
      const findPlayerInDB = await this.playersEntity.findOne({
        where: { id: fastestResponder.id },
      });
      findPlayerInDB.score++;
      await this.playersEntity.save(findPlayerInDB);
      return true;
    }
    return true;
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
    return this.playersEntity.findOne({
      where: { id: idPlayer },
      relations: ['answers'],
    });
  }
  async getGameById(id: string): Promise<OutputTypePairToGetId | false> {
    const findPair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: {
        id: id,
      },
      relations: {
        question: true,
        firstPlayer: true,
        secondPlayer: true,
      },
    });
    if (!findPair) return false;
    return findPair;
  }
  async findPlayer(id: string, gameId: string): Promise<findingPlayer | null> {
    return this.playersEntity.findOne({
      where: { userId: id, game: { id: gameId } },
      relations: { answers: true },
    });

    // return this.playersEntity
    //   .createQueryBuilder('q')
    //   .leftJoinAndSelect('q.answers', 'a')
    //   .where('q.id = :id', { id })
    //   .getOne();
  }
  async findPlayerById(id: string): Promise<findingPlayer | null> {
    return this.playersEntity.findOne({
      where: { id: id },
      relations: { answers: true },
    });

    // return this.playersEntity
    //   .createQueryBuilder('q')
    //   .leftJoinAndSelect('q.answers', 'a')
    //   .where('q.id = :id', { id })
    //   .getOne();
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

  async findPendingStatusPair(
    userId: string,
  ): Promise<QuizGameEntityNotPlayerInfo | false | 'Active'> {
    const pendingPair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: { status: StatusTypeEnum.PendingSecondPlayer },
      relations: {
        firstPlayer: true,
        secondPlayer: true,
      },
    });
    const activePair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: [
        {
          firstPlayer: { userId: userId },
          status: StatusTypeEnum.Active,
        },
        {
          secondPlayer: { userId: userId },
          status: StatusTypeEnum.Active,
        },
      ],
      relations: {
        firstPlayer: true,
        secondPlayer: true,
      },
    });
    if (activePair) return 'Active';
    else if (
      pendingPair &&
      (pendingPair.firstPlayer.userId === userId ||
        pendingPair.secondPlayer?.userId === userId)
    )
      return 'Active';
    return pendingPair ? pendingPair : false;
  }

  async endGameAndCountingScore(player: findingPlayer) {
    const now = new Date().toISOString();

    const findPair_0 = await this.quizGameEntityNotPlayerInfo.findOne({
      where: [{ firstPlayerId: player.id }, { secondPlayerId: player.id }],
      relations: {
        question: true,
      },
    });
    const [findPlayer1, findPlayer2] = await Promise.all([
      this.findPlayerById(findPair_0.firstPlayerId),
      this.findPlayerById(findPair_0.secondPlayerId),
    ]);
    const player1Completed = findPlayer1.answers.length === 5;
    const player2Completed = findPlayer2.answers.length === 5;
    //   this.findPlayer(findPair_0.firstPlayerId);
    // const findPlayer2 = await
    if (player1Completed && player2Completed) {
      findPair_0.finishGameDate = now;
      findPair_0.status = StatusTypeEnum.Finished;
      await this.quizGameEntityNotPlayerInfo.save(findPair_0);
      return findPair_0;
    }
    if (player1Completed || player2Completed) {
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
    // await this.deleteAnswerPlayer(userModel.userId);
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
      userId: userModel.userId,
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
    const game = await this.quizGameEntityNotPlayerInfo.findOne({
      where: { id: gameId },
      relations: ['question'],
    });
    if (!game) {
      throw new Error('Game not found');
    }
    const getRandomFiveQuestion = await this.questionsEntity
      .createQueryBuilder('q')
      .where('q.published = true')
      .orderBy('RANDOM()')
      .take(5)
      .getMany();
    game.question = getRandomFiveQuestion.sort((a, b) => +a.id - +b.id);
    await this.quizGameEntityNotPlayerInfo.save(game);
    return getRandomFiveQuestion;
  }

  async pairHistoryMapper(game: QuizGameInDB): Promise<OutputTypePair> {
    const findFirstPlayer = await this.findPlayerById(game.firstPlayerId);
    const findSecondPlayer = await this.findPlayerById(game.secondPlayerId);
    const questions1 = game.question.map((q) => ({
      id: q.id.toString(),
      body: q.body,
    }));
    const answer = findFirstPlayer.answers
      .map((m) => ({
        questionId: m.questionId.toString(),
        answerStatus: m.answerStatus,
        addedAt: m.addedAt,
      }))
      .sort(
        (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
      );
    const answer1 = findSecondPlayer
      ? findSecondPlayer.answers
          .map((m) => ({
            questionId: m.questionId.toString(),
            answerStatus: m.answerStatus,
            addedAt: m.addedAt,
          }))
          .sort(
            (a, b) =>
              new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
          )
      : [];
    return {
      id: game.id.toString(),
      firstPlayerProgress: {
        answers: answer,
        player: {
          id: findFirstPlayer.userId.toString(),
          login: findFirstPlayer.login,
        },
        score: findFirstPlayer.score,
      },
      secondPlayerProgress:
        findSecondPlayer !== null
          ? {
              answers: answer1,
              player: {
                id: findSecondPlayer.userId,
                login: findSecondPlayer.login,
              },
              score: findSecondPlayer.score,
            }
          : null,
      questions: findSecondPlayer !== null ? questions1 : null,
      status:
        game.status !== null ? game.status : StatusTypeEnum.PendingSecondPlayer,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
