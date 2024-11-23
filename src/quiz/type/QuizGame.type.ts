import { PlayersEntity } from '../entity/Players.Entity';
import { StatusTypeEnumByAnswersToEndpoint } from '../entity/QuizGame.entity';
import { questBodyToOutput1, questBodyToOutput12 } from './question.type';
export class QuizGameClass3 {
  public firstPlayerId: string;
  public secondPlayerId: string | null;
  public status: StatusTypeEnum;
  public pairCreatedDate: string;
  public startGameDate: string | null;
  public finishGameDate: string | null;

  constructor({
    firstPlayerId,
    secondPlayerId,
    status,
    pairCreatedDate,
    startGameDate,
    finishGameDate,
  }) {
    this.firstPlayerId = firstPlayerId;
    this.secondPlayerId = secondPlayerId;
    this.status = status;
    this.pairCreatedDate = pairCreatedDate;
    this.startGameDate = startGameDate;
    this.finishGameDate = finishGameDate;
  }
}

export type AnswerType = {
  questionId: string;
  answerStatus: string;
  addedAt: string;
};

export type ViewModelPairToOutput = {
  id: string;
  firstPlayerProgress: {
    answers: Array<AnswerType>;
    player: {
      id: string;
      login: string;
    };
    score: number;
  };
  secondPlayerProgress: {
    answers: Array<AnswerType>;
    player: {
      id: string | null;
      login: string | null;
    };
    score: number | null;
  };
  questions: questBodyToOutput1[] | [];
  status: StatusTypeEnum;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
};
export type BaseTypeQuizGame = {
  id: string;
  firstPlayer: PlayersEntity;
  firstPlayerId: string;
  secondPlayer: PlayersEntity | null;
  secondPlayerId: string | null;
  question: questBodyToOutput12[] | [];
  status: StatusTypeEnum;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
};
export enum StatusTypeEnumToObject {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}
export enum StatusTypeEnum {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

export type updateTypeOfQuestion1 = {
  id: number;
  questionId: string;
  playerId: string;
  answerStatus: StatusTypeEnumByAnswersToEndpoint;
  answer: string;
  addedAt: string;
};
export type QuizGameInDB = {
  id: string;
  firstPlayerId: string;
  secondPlayerId: string | null;
  status: StatusTypeEnum;
  pairCreatedDate: string;
  startGameDate: string;
  question: questBodyToOutput12[] | [];
  finishGameDate: string;
};
export type AnswerInput = {
  answer: string;
};
