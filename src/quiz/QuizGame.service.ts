import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from './QuizGame.TypeOrmRepo';
import {
  AnswerType,
  OutputTypePair,
  QuizGameClass,
  QuizGameClass1,
  QuizGameInDB,
  StatusTypeEnumToObject,
  updateTypeOfQuestion,
} from './type/QuizGame.type';
import { NewestPostLike } from '../Users/Type/User.type';

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
  async getGameByIdInService(id: number): Promise<OutputTypePair | false> {
    const findGame = await this.quizGameRepo.getGameById(id);
    if (!findGame) return false;
    return this.quizGameMapperOnOutputTypePair(findGame);
  }
  async findActivePairInService(
    userModel: NewestPostLike,
  ): Promise<OutputTypePair> {
    const findCurrencyPair = await this.quizGameRepo.findActivePair();
    if (!findCurrencyPair) {
      return await this.createPair(userModel);
    }
    const updateBodyPairConnectSecondUser =
      await this.quizGameRepo.connectSecondUserWithFirstUserRepo(userModel);
    return this.quizGameMapperOnOutputTypePair(updateBodyPairConnectSecondUser);
  }
  async createPair(userModel: NewestPostLike): Promise<OutputTypePair> {
    const newPlayer = await this.quizGameRepo.newPlayerOnQuizGame(userModel);
    const now = new Date();
    const newActivePair = new QuizGameClass1(
      newPlayer.id,
      null,
      StatusTypeEnumToObject.PendingSecondPlayer,
      now.toISOString(),
      '0',
      '0',
    );
    const newPair =
      await this.quizGameRepo.createNewPairWithNewSingleUser(newActivePair);
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
  ): Promise<AnswerType> {
    const findPlayerInGame: updateTypeOfQuestion =
      await this.quizGameRepo.getPairGameByPlayerId(+user.userId, answer);

    return this.answerBodyMapper(findPlayerInGame);
  }

  async answerBodyMapper(answer: updateTypeOfQuestion): Promise<AnswerType> {
    return {
      questionId: answer.questionId.toString(),
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt,
    };
  }

  async quizGameMapperOnOutputTypePair(
    game: QuizGameInDB,
  ): Promise<OutputTypePair> {
    const findPlayerInGameTheFirstPlayer = await this.quizGameRepo.findPlayer(
      game.firstPlayerId,
    );
    const findPlayerInGameTheScorePlayer = await this.quizGameRepo.findPlayer(
      game.secondPlayerId,
    );
    console.log(findPlayerInGameTheFirstPlayer, findPlayerInGameTheScorePlayer);
    // const question = questions.map((q) => ({
    //   id: q.id.toString(),
    //   body: q.body,
    // }));
    const answer1 = findPlayerInGameTheFirstPlayer.answers.map((m) => ({
      questionId: m.question.toString(),
      answerStatus: m.answerStatus,
      addedAt: m.addedAt,
    }));
    const answer2 = findPlayerInGameTheScorePlayer.answers.map((m) => ({
      questionId: m.question.toString(),
      answerStatus: m.answerStatus,
      addedAt: m.addedAt,
    }));
    findPlayerInGameTheFirstPlayer.answers;
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
        answers: answer2,
        player: {
          id: game.secondPlayerId.toString(),
          login: findPlayerInGameTheScorePlayer.login,
        },
        score: findPlayerInGameTheScorePlayer.score,
      },
      questions: game.question,
      status: game.status,
      pairCreatedDate: 'string',
      startGameDate: 'string',
      finishGameDate: 'string',
    };
  }
}
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
