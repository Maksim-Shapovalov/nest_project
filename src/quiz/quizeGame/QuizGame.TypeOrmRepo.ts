import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
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
        {
          firstPlayer: { userId: playerId },
          status: Not(StatusTypeEnum.PendingSecondPlayer),
        },
        {
          secondPlayer: { userId: playerId },
          status: Not(StatusTypeEnum.PendingSecondPlayer),
        },
      ],
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
  async getActivePairWhereOnePlayerAnsweredAllQuestions(): Promise<
    QuizGameEntityNotPlayerInfo[] | false
  > {
    const pairs = await this.quizGameEntityNotPlayerInfo.find({
      where: {
        status: StatusTypeEnum.Active,
      },
      relations: {
        question: true,
        firstPlayer: { answers: true },
        secondPlayer: { answers: true },
      },
    });
    const findPairWherePlayerAddAnswerTo5Questions = pairs.filter((pair) => {
      return (
        (pair.firstPlayer && pair.firstPlayer.answers.length === 5) ||
        (pair.secondPlayer && pair.secondPlayer.answers.length === 5)
      );
    });
    if (!findPairWherePlayerAddAnswerTo5Questions) return false;
    return findPairWherePlayerAddAnswerTo5Questions;
  }
  async updateAnswerToPlayerIdInGame(
    answeringUserId: string,
    answer: string,
  ): Promise<updateTypeOfQuestion1 | false> {
    const now = new Date().toISOString();
    const findPair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: [
        {
          firstPlayer: { userId: answeringUserId },
          status: StatusTypeEnum.Active,
        },
        {
          secondPlayer: { userId: answeringUserId },
          status: StatusTypeEnum.Active,
        },
      ],
      relations: ['question', 'secondPlayer', 'firstPlayer'],
    });
    if (!findPair) return false;
    const anotherPlayerId =
      findPair.secondPlayer.userId !== answeringUserId
        ? findPair.secondPlayer.userId
        : findPair.firstPlayer.userId;
    const [answeringPlayer, anotherPlayer] = await Promise.all([
      this.findPlayer(answeringUserId, findPair.id),
      this.findPlayer(anotherPlayerId, findPair.id),
    ]);
    if (
      answeringPlayer.answers.length === 5 ||
      (answeringPlayer.answers.length === 5 &&
        anotherPlayer.answers.length === 5)
    ) {
      console.log('PPPPPPPPPPPPPPPPPPPP');
      return false;
    }

    const num = findPair.question.slice(answeringPlayer.answers.length)[0];
    if (!num) {
      console.error('no 5 questions');
      return false;
    }

    const findQuestion = await this.questionsEntity.findOne({
      where: { id: num.id },
    });

    const findAllAnswersWherePlayerAlreadyAnswered =
      await this.answersEntity.find({
        where: {
          questionId: findQuestion.id,
          playerId: answeringPlayer.id,
          player: { game: { id: findPair.id } },
        },
      });

    if (findAllAnswersWherePlayerAlreadyAnswered.length > 0) {
      console.log('player already answered this question');
      return false;
    }

    if (answeringPlayer.answers.length >= 5) {
      console.log('player already answered all questions');

      return false;
    }
    // if (anotherPlayer.answers && anotherPlayer.answers.length >= 5) {
    //   console.log('another player already answered all answers');
    //   return false;
    // }

    const scoreChange = findQuestion.correctAnswers.includes(answer) ? 1 : 0;
    const addAnswer = await this.answersEntity.create({
      questionId: num.id,
      answer: answer,
      addedAt: now,
      player: answeringPlayer,
      answerStatus:
        scoreChange === 1
          ? StatusTypeEnumByAnswersToEndpoint.correct
          : StatusTypeEnumByAnswersToEndpoint.incorrect,
      playerId: answeringUserId,
    });
    const savedAnswer = await this.answersEntity.save(addAnswer);
    await this.changeScoreToPlayer(scoreChange, answeringPlayer.id);
    const pair = await this.getGameById(findPair.id);
    if (!pair) return false;
    if (
      pair &&
      pair.firstPlayer.answers.length === 5 &&
      pair.secondPlayer.answers.length === 5
    ) {
      pair.finishGameDate = now;
      pair.status = StatusTypeEnum.Finished;
      const savePair = await this.quizGameEntityNotPlayerInfo.save(pair);
      await this.addBonusPoint(savePair);
    }
    const returnAnswer = await this.answersEntity.findOne({
      where: { id: savedAnswer.id },
    });
    if (!returnAnswer) return false;
    return {
      ...returnAnswer,
      questionId: returnAnswer.questionId.toString(),
    };
  }
  async addIncorrectAnswersAfter10sec(
    game: BaseTypeQuizGame,
    player: PlayersEntity,
  ) {
    const now = new Date().toISOString();
    const findPlayerInGame = await this.playersEntity.findOne({
      where: { id: player.id },
      relations: {
        answers: true,
      },
    });
    const lengthPlayerAnswers = findPlayerInGame.answers.length;
    const currentQuestions = game.question.slice(lengthPlayerAnswers)[0];
    const addIncorrectAnswerToPlayer = await this.answersEntity.create({
      questionId: currentQuestions.id,
      answer: 'incorrect',
      addedAt: now,
      player: player,
      answerStatus: StatusTypeEnumByAnswersToEndpoint.incorrect,
      playerId: player.id,
    });
    const savedAnswer = await this.answersEntity.save(
      addIncorrectAnswerToPlayer,
    );
    const gameInWhichAddIncorrectAnswers =
      await this.quizGameEntityNotPlayerInfo.findOne({
        where: { id: game.id },
        relations: {
          firstPlayer: { answers: true },
          secondPlayer: { answers: true },
        },
      });
    if (
      gameInWhichAddIncorrectAnswers.firstPlayer.answers.length === 5 &&
      gameInWhichAddIncorrectAnswers.secondPlayer.answers.length === 5
    ) {
      gameInWhichAddIncorrectAnswers.finishGameDate = now;
      gameInWhichAddIncorrectAnswers.status = StatusTypeEnum.Finished;
      await this.quizGameEntityNotPlayerInfo.save(
        gameInWhichAddIncorrectAnswers,
      );
      await this.addBonusPoint(gameInWhichAddIncorrectAnswers);
    }
    return savedAnswer;
  }

  async getGameById(id: string): Promise<BaseTypeQuizGame | false> {
    const findPair = await this.quizGameEntityNotPlayerInfo.findOne({
      where: {
        id: id,
      },
      relations: {
        question: true,
        firstPlayer: { answers: true },
        secondPlayer: { answers: true },
      },
    });
    if (!findPair) return false;
    return findPair;
  }

  async findPlayerById(id: string | null): Promise<PlayersEntity | null> {
    if (id === null) return null;
    return this.playersEntity.findOne({
      where: { id: id },
      relations: { answers: true },
    });
  }
  async findPlayerByUserId(id: string): Promise<PlayersEntity | false> {
    return this.playersEntity.findOne({
      where: { userId: id, game: { status: StatusTypeEnum.Active } },
      relations: { answers: true, game: true },
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
    if (
      pendingPair &&
      (pendingPair.firstPlayer.userId === userId ||
        pendingPair.secondPlayer?.userId === userId)
    )
      return 'Active';
    return pendingPair ? pendingPair : false;
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
  private async addBonusPoint(game: QuizGameEntityNotPlayerInfo) {
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
  private async changeScoreToPlayer(point: number, idPlayer: string) {
    const player = await this.playersEntity.findOne({
      where: { id: idPlayer },
      relations: ['answers'],
    });
    player.score = player.score + point;
    await this.playersEntity.save(player);
    return true;
  }
  private async findPlayer(
    id: string,
    gameId: string,
  ): Promise<findingPlayer | null> {
    return this.playersEntity.findOne({
      where: { userId: id, game: { id: gameId } },
      relations: { answers: true },
    });
  }

  private async choiceFiveQuestion(gameId: string) {
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
