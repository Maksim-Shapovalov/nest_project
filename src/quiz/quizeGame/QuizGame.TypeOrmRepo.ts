import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import {
  BaseTypeQuizGame,
  QuizGameClass3,
  QuizGameInDB,
  StatusTypeEnum,
  updateTypeOfQuestion1,
} from '../type/QuizGame.type';
import { NewestPostLike } from '../../Users/Type/User.type';
import { findingPlayer, PlayersEntity } from '../entity/Players.Entity';
import { QuestionsEntity } from '../entity/Questions.Entity';
import {
  AnswersEntity,
  QuizGameEntityNotPlayerInfo,
  StatusTypeEnumByAnswersToEndpoint,
} from '../entity/QuizGame.entity';
import { PaginationQueryType } from '../../qurey-repo/query-filter';

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

  async getTopPlayers() {
    return this.playersEntity.find({});
  }

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
          firstPlayer: true,
          secondPlayer: true,
        },
        order: {
          [filter.sortBy]: filter.sortDirection,
          pairCreatedDate: 'desc',
        },
        take: pageSizeInQuery,
        skip: (filter.pageNumber - 1) * pageSizeInQuery,
      });
    const totalCount = parseInt(totalCountPair.toString());
    const itemsPromises = await Promise.all(
      pairs.map(async (pair: BaseTypeQuizGame) => {
        const findFirstPlayer = await this.findPlayerById(pair.firstPlayerId);
        const findSecondPlayer = await this.findPlayerById(pair.secondPlayerId);
        return QuizGameEntityNotPlayerInfo.getViewModel(
          pair,
          findFirstPlayer,
          findSecondPlayer,
        );
      }),
    );
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
      where: [
        { firstPlayer: { userId: playerId } },
        { secondPlayer: { userId: playerId } },
      ],
      relations: { firstPlayer: true, secondPlayer: true },
    });
  }
  async getUnfinishedCurrentGameRepo(
    userModel: NewestPostLike,
  ): Promise<BaseTypeQuizGame | false> {
    const pairs = await this.quizGameEntityNotPlayerInfo.find({
      where: {
        status: In([StatusTypeEnum.Active, StatusTypeEnum.PendingSecondPlayer]),
      },
      relations: {
        question: true,
        firstPlayer: true,
        secondPlayer: true,
      },
    });
    const findPair = pairs.find(
      (pair) =>
        pair.firstPlayer.userId === userModel.userId ||
        pair.secondPlayer.userId === userModel.userId,
    );
    if (!findPair || findPair.status === StatusTypeEnum.Finished) return false;
    return findPair;
  }
  async updateAnswerToPlayerIdInGame(
    id: string,
    answer: string,
  ): Promise<updateTypeOfQuestion1> {
    const now = new Date().toISOString();
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
    const findPlayer = await this.findPlayer(id, findPair.id);
    const numberOfResponse = findPlayer.answers.length;
    const num = findPair.question.slice(numberOfResponse)[0];
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
      playerId: findPlayer.id,
    });
    const savedAnswer = await this.answersEntity.save(addAnswer);
    const scoreChange = findQuestion.correctAnswers.includes(answer) ? 1 : 0;
    await this.changeScoreToPlayer(scoreChange, findPlayer.id, savedAnswer);
    const pair = await this.getGameById(findPair.id);
    if (
      pair &&
      pair.firstPlayer.answers.length === 5 &&
      pair.secondPlayer.answers.length === 5
    ) {
      pair.finishGameDate = new Date().toISOString();
      pair.status = StatusTypeEnum.Finished;
      const savePair = await this.quizGameEntityNotPlayerInfo.save(pair);
      await this.addBonusPoint(savePair);
    }

    // const findPlayer = await this.findPlayer(id, findPair.id);
    // if (findPlayer.answers.length === 5) {
    //   const verifyAnswerTwoPlayer = await this.endGameAndCountingScore(
    //     findPlayer,
    //     findPair.id,
    //   );
    //   if (typeof verifyAnswerTwoPlayer !== 'boolean') {
    //     await this.addBonusPoint(verifyAnswerTwoPlayer);
    //   }
    // }
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
    const lastAnswerFirstPlayer = findPlayerFirst.answers.at(-1);
    const lastAnswerSecondPlayer = findPlayerSecond.answers.at(-1);
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
    return true;
  }
  async getGameById(id: string): Promise<BaseTypeQuizGame | false> {
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
  async findPlayerById(id: string | null): Promise<PlayersEntity | null> {
    if (id === null) return null;
    return this.playersEntity.findOne({
      where: { id: id },
      relations: { answers: true },
    });
  }
  async findPlayerByUserId(id: string): Promise<PlayersEntity> {
    return this.playersEntity.findOne({
      where: { userId: id },
      relations: { answers: true },
    });
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

  async endGameAndCountingScore(player: findingPlayer, gameId: string) {
    const now = new Date().toISOString();

    const findPair_0 = await this.quizGameEntityNotPlayerInfo.findOne({
      // where: [{ firstPlayerId: player.id }, { secondPlayerId: player.id }],
      where: { id: gameId },
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
    return player1Completed || player2Completed;
  }

  async createNewPairWithNewSingleUser(
    newPlayer: PlayersEntity,
    newPair: QuizGameClass3,
    newPlayerId: string,
  ): Promise<BaseTypeQuizGame> {
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
        firstPlayer: true,
        secondPlayer: true,
      },
    });
  }

  async connectSecondUserWithFirstUserRepo(
    userModel: NewestPostLike,
    now: string,
  ): Promise<BaseTypeQuizGame> {
    // await this.deleteAnswerPlayer(userModel.userId);
    const findActivePair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: {
        secondPlayerId: null,
        status: StatusTypeEnum.PendingSecondPlayer,
      },
      relations: {
        question: true,
        firstPlayer: true,
        secondPlayer: true,
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
    await this.choiceFiveQuestion(findActivePair.id);

    return this.quizGameEntityNotPlayerInfo.findOne({
      where: { id: findActivePair.id },
      relations: {
        secondPlayer: true,
        firstPlayer: true,
        question: true,
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
}
