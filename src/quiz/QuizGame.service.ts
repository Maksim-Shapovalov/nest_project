import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from './QuizGame.TypeOrmRepo';
import {
  AnswerType,
  OutputTypePair,
  OutputTypePairToGetId,
  QuizGameClass1,
  QuizGameInDB,
  StatusTypeEnum,
  updateTypeOfQuestion1,
} from './type/QuizGame.type';
import { NewestPostLike } from '../Users/Type/User.type';
import { QuizGameEntityNotPlayerInfo } from './entity/QuizGame.entity';

@Injectable()
export class QuizGameService {
  constructor(protected quizGameRepo: QuizGameTypeOrmRepo) {}

  async getUnfinishedCurrentGameService(
    userModel: NewestPostLike,
  ): Promise<OutputTypePair | false> {
    const findPairToCurrentUser =
      await this.quizGameRepo.getUnfinishedCurrentGameRepo(userModel);
    // if (findPairToCurrentUser.firstPlayerId !== userModel.userId) return null;
    if (!findPairToCurrentUser) return false;
    return this.quizGameMapperOnOutputTypePair(findPairToCurrentUser);
  }
  async getGameById(id: string): Promise<OutputTypePair | false> {
    const findGame = await this.quizGameRepo.getGameById(id);
    if (!findGame) return false;
    return this.returnMapperByGameId(findGame);
  }
  async getGameByIdInService(id: string): Promise<OutputTypePair | false> {
    const findGame = await this.quizGameRepo.getGameById(id);
    if (!findGame) return false;
    return this.quizGameMapperOnOutputTypePair(findGame);
  }
  async findActivePairInService(
    userModel: NewestPostLike,
  ): Promise<OutputTypePair | false> {
    const now = new Date().toISOString();
    const findCurrencyPair = await this.quizGameRepo.findActivePair(
      userModel.userId,
    );
    if (findCurrencyPair === 'Active') return false;
    if (!findCurrencyPair) {
      return await this.createPair(userModel);
    }
    const updateBodyPairConnectSecondUser =
      await this.quizGameRepo.connectSecondUserWithFirstUserRepo(
        userModel,
        now,
      );
    const game = await this.getGameByIdInService(findCurrencyPair.id);
    if (!game) return await this.createPair(userModel);
    return this.quizGameMapperAddSecondPlayer(
      game,
      updateBodyPairConnectSecondUser,
    );
  }

  async createPair(userModel: NewestPostLike): Promise<OutputTypePair> {
    const now = new Date().toISOString();
    await this.quizGameRepo.deleteAnswerPlayer(userModel.userId);
    const newPlayer = await this.quizGameRepo.newPlayerOnQuizGame(userModel);
    const newActivePair = new QuizGameClass1(
      newPlayer.id,
      null,
      StatusTypeEnum.PendingSecondPlayer,
      now,
      null,
      null,
    );
    const newPair = await this.quizGameRepo.createNewPairWithNewSingleUser(
      newPlayer,
      newActivePair,
      newPlayer.id,
    );
    await this.quizGameRepo.newPlayerOnQuizGameUpdateInfo(newPlayer, newPair);
    return this.quizGameMapperOnOutputTypePair(newPair);
  }

  // async connectCurrentUserService(
  //   userModel: NewestPostLike,
  // ): Promise<OutputTypePair> {
  //   const findPair =
  //     await this.quizGameRepo.connectSecondUserWithFirstUserRepo(userModel);
  // }

  async sendAnswerService(
    answer: string,
    user: NewestPostLike,
  ): Promise<AnswerType | false> {
    const findPlayerInGame: updateTypeOfQuestion1 | false =
      await this.quizGameRepo.updateAnswerToPlayerIdInGame(user.userId, answer);
    // if (!findPlayerInGame) return false;
    return findPlayerInGame ? findPlayerInGame : false;
  }

  async answerBodyMapper(answer: updateTypeOfQuestion1): Promise<AnswerType> {
    return {
      questionId: answer.questionId.toString(),
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt,
    };
  }

  async quizGameMapperOnOutputTypePair(
    game: QuizGameInDB,
  ): Promise<OutputTypePair> {
    const findPlayer = await this.quizGameRepo.findPlayer(game.firstPlayerId);
    let questions1 = [];
    // console.log(game.question.length, 'game.question.length');
    if (game && game.question.length > 0) {
      questions1 = game.question.map((q) => ({
        id: q.id,
        body: q.body,
      }));
    }
    // const questions = game.question.map((q) => ({
    //   id: q.id,
    //   body: q.body,
    // }));
    let findSecondPlayer = null;
    if (game.secondPlayerId !== null) {
      findSecondPlayer = await this.quizGameRepo.findPlayer(
        game.secondPlayerId,
      );
    }

    const answer = findPlayer.answers.map((m) => ({
      questionId: m.questionId.toString(),
      answerStatus: m.answerStatus,
      addedAt: m.addedAt,
    }));
    let answer1 = [];
    if (findSecondPlayer) {
      answer1 = findSecondPlayer.answers.map((m) => ({
        questionId: m.questionId.toString(),
        answerStatus: m.answerStatus,
        addedAt: m.addedAt,
      }));
    }

    return {
      id: game.id.toString(),
      firstPlayerProgress: {
        answers: answer,
        player: {
          id: findPlayer.id.toString(),
          login: findPlayer.login,
        },
        score: findPlayer.score,
      },
      secondPlayerProgress:
        findSecondPlayer !== null
          ? {
              answers: answer1,
              player: {
                id: findSecondPlayer.id,
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

  async quizGameMapperAddSecondPlayer(
    game: OutputTypePair,
    game1: QuizGameEntityNotPlayerInfo,
  ): Promise<OutputTypePair> {
    const fiveQuestion = await this.quizGameRepo.choiceFiveQuestion(game.id);
    console.log(fiveQuestion, 'fiveQuestion');
    const findSecondPlayer = await this.quizGameRepo.findPlayer(
      game1.secondPlayerId,
    );
    const answer = findSecondPlayer.answers
      .map((m) => ({
        questionId: m.questionId.toString(),
        answerStatus: m.answerStatus,
        addedAt: m.addedAt,
      }))
      .sort(
        (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
      );
    const fiveQuestionsMapper = fiveQuestion.map((m) => ({
      id: m.id,
      body: m.body,
    }));
    return {
      id: game.id,
      firstPlayerProgress: {
        answers: game.firstPlayerProgress.answers.sort(
          (a, b) =>
            new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
        ),
        player: {
          id: game.firstPlayerProgress.player.id,
          login: game.firstPlayerProgress.player.login,
        },
        score: game.firstPlayerProgress.score,
      },
      secondPlayerProgress: {
        answers: answer,
        player: {
          id: findSecondPlayer.id.toString(),
          login: findSecondPlayer.login,
        },
        score: findSecondPlayer.score,
      },
      questions: fiveQuestionsMapper,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
  async returnMapperByGameId(
    game: OutputTypePairToGetId,
  ): Promise<OutputTypePair> {
    const findFirstPlayer = await this.quizGameRepo.findPlayer(
      game.firstPlayerId,
    );
    const findSecondPlayer = await this.quizGameRepo.findPlayer(
      game.secondPlayerId,
    );
    let answer = [];
    let answer1 = [];
    answer = findFirstPlayer.answers
      .map((m) => ({
        questionId: m.questionId.toString(),
        answerStatus: m.answerStatus,
        addedAt: m.addedAt,
      }))
      .sort(
        (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
      );
    answer1 = findSecondPlayer
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

    const questions = game.question.map((m) => ({
      id: m.id.toString(),
      body: m.body,
    }));
    return {
      id: game.id.toString(),
      firstPlayerProgress: {
        answers: answer,
        player: {
          id: game.firstPlayerId.toString(),
          login: findFirstPlayer.login,
        },
        score: findFirstPlayer.score,
      },
      secondPlayerProgress:
        game.secondPlayerId !== null
          ? {
              answers: answer1,
              player: {
                id: game.secondPlayerId.toString(),
                login: findSecondPlayer.login,
              },
              score: findSecondPlayer.score,
            }
          : null,
      questions: game.secondPlayerId !== null ? questions : null,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.secondPlayerId !== null ? game.startGameDate : null,
      finishGameDate: game.secondPlayerId !== null ? game.finishGameDate : null,
    };
  }
}
