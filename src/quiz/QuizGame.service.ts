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
    const findCurrencyPair = await this.quizGameRepo.findActivePair();
    if (!findCurrencyPair) {
      return await this.createPair(userModel);
    }
    if (findCurrencyPair.firstPlayerId === userModel.userId) return false;
    const updateBodyPairConnectSecondUser =
      await this.quizGameRepo.connectSecondUserWithFirstUserRepo(userModel);
    const game = await this.getGameByIdInService(findCurrencyPair.id);
    if (!game) return await this.createPair(userModel);
    return this.quizGameMapperAddSecondPlayer(
      game,
      updateBodyPairConnectSecondUser,
    );
  }
  async createPair(userModel: NewestPostLike): Promise<OutputTypePair> {
    const newPlayer = await this.quizGameRepo.newPlayerOnQuizGame(userModel);
    const now = new Date();
    const newActivePair = new QuizGameClass1(
      newPlayer.id,
      null,
      StatusTypeEnum.PendingSecondPlayer,
      now.toISOString(),
      '0',
      '0',
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
  ): Promise<AnswerType | null> {
    const findPlayerInGame: updateTypeOfQuestion1 | false =
      await this.quizGameRepo.updateAnswerToPlayerIdInGame(user.userId, answer);
    if (!findPlayerInGame) return null;
    return this.answerBodyMapper(findPlayerInGame);
  }

  async answerBodyMapper(answer: updateTypeOfQuestion1): Promise<AnswerType> {
    console.log(answer, 'answer');
    return {
      // questionId: answer.question.id.toString(),
      questionId: answer.questionId.toString(),
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt,
    };
  }

  async quizGameMapperOnOutputTypePair(
    game: QuizGameInDB,
  ): Promise<OutputTypePair> {
    const now = new Date().toISOString();
    const findPlayer = await this.quizGameRepo.findPlayer(game.firstPlayerId);
    const questions = game.question.map((q) => ({
      id: q.id,
      body: q.body,
    }));
    const findSecondPlayer = await this.quizGameRepo.findPlayer(
      game.secondPlayerId,
    );
    console.log(findPlayer);
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
      secondPlayerProgress: {
        answers: answer1,
        player: {
          id: findSecondPlayer ? findSecondPlayer.id : null,
          login: findSecondPlayer ? findSecondPlayer.login : null,
        },
        score: findSecondPlayer ? findSecondPlayer.score : 0,
      },
      questions: questions,
      status: game.status,
      pairCreatedDate: now,
      startGameDate: 'string',
      finishGameDate: 'string',
    };
  }

  async quizGameMapperAddSecondPlayer(
    game: OutputTypePair,
    game1: QuizGameEntityNotPlayerInfo,
  ): Promise<OutputTypePair> {
    const now = new Date().toISOString();
    const fiveQuestion = await this.quizGameRepo.choiceFiveQuestion(game.id);
    const findSecondPlayer = await this.quizGameRepo.findPlayer(
      game1.secondPlayerId,
    );
    console.log(findSecondPlayer, 'findSecondPlayer-----------');
    const answer = findSecondPlayer.answers.map((m) => ({
      questionId: m.questionId.toString(),
      answerStatus: m.answerStatus,
      addedAt: m.addedAt,
    }));
    return {
      id: game.id,
      firstPlayerProgress: {
        answers: game.firstPlayerProgress.answers,
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
      questions: fiveQuestion,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: now,
      finishGameDate: 'string',
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
    const answer = findFirstPlayer.answers.map((m) => ({
      questionId: m.question.toString(),
      answerStatus: m.answerStatus,
      addedAt: m.addedAt,
    }));

    const answer1 = findSecondPlayer
      ? findSecondPlayer.answers.map((m) => ({
          questionId: m.question.toString(),
          answerStatus: m.answerStatus,
          addedAt: m.addedAt,
        }))
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
      secondPlayerProgress: {
        answers: answer1,
        player: {
          id:
            game.secondPlayerId !== null
              ? game.secondPlayerId.toString()
              : null,
          login:
            findSecondPlayer.login !== null ? findSecondPlayer.login : null,
        },
        score: findSecondPlayer.score ? findSecondPlayer.score : 0,
      },
      questions: questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
/*
return {
      id: game.id.toString(),
      firstPlayerProgress: {
        answers: answer1,
        player: {
          id: game.firstPlayerId.toString(),
          login: findPlayerInGameTheFirstPlayer.login,
        },
        score: findPlayerInGameTheFirstPlayer.score,
      },
      secondPlayerProgress: {
        answers: findPlayerInGameTheScorePlayer ? answer2 : [],
        player: {
          id: game.secondPlayerId ? game.secondPlayerId.toString() : null,
          login: findPlayerInGameTheScorePlayer
            ? findPlayerInGameTheScorePlayer.login
            : null,
        },
        score: findPlayerInGameTheScorePlayer
          ? findPlayerInGameTheScorePlayer.score
          : 0,
      },
      questions: fiveQuestion,
      status: game.status,
      pairCreatedDate: 'string',
      startGameDate: 'string',
      finishGameDate: 'string',
    };
 */
// export const quizGameMapperOnOutputTypePair = (
//   game: QuizGameInDB,
//   // questions: Array<QuestionsEntity> | null,
// ): OutputTypePair => {
//   const findPlayerInGame = await
//   // const question = questions.map((q) => ({
//   //   id: q.id.toString(),
//   //   body: q.body,
//   // }));
//   return {
//     id: game.id,
//     firstPlayerProgress: {
//       answers: [],
//       player: {
//         id: game.firstPlayerId.toString(),
//         login: game.firstPlayerLogin,
//       },
//       score: game.scoreFirstPlayer,
//     },
//     secondPlayerProgress: {
//       answers: [
//         {
//           questionId: 'string',
//           answerStatus: 'string',
//           addedAt: 'string',
//         },
//       ],
//       player: {
//         id: game.secondPlayerId.toString(),
//         login: game.secondPlayerLogin,
//       },
//       score: game.scoreSecondPlayer,
//     },
//     questions: game.question,
//     status: game.status,
//     pairCreatedDate: 'string',
//     startGameDate: 'string',
//     finishGameDate: 'string',
//   };
// };
// questions: Array<QuestionsEntity> | null,
// const question = questions.map((q) => ({
//   id: q.id.toString(),
//   body: q.body,
// }));
// questions: questions ? question : null,
