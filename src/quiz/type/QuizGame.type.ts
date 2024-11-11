import { QuestionsEntity } from '../entity/Questions.Entity';
import { PlayersEntity } from '../entity/Players.Entity';
import { StatusTypeEnumByAnswersToEndpoint } from '../entity/QuizGame.entity';
import { questBodyToOutput1, questBodyToOutput12 } from './question.type';

export class QuizGameClass {
  constructor(
    public firstPlayerId: number,
    public firstPlayerLogin: string,
    public scoreFirstPlayer: number,
    public secondPlayerId: number | null,
    public secondPlayerLogin: string | null,
    public scoreSecondPlayer: number,
    public status: StatusTypeEnumToObject,
    public pairCreatedDate: string,
    public startGameDate: string,
    public finishGameDate: string,
  ) {}
}

export class QuizGameClass1 {
  constructor(
    public firstPlayerId: string,
    public secondPlayerId: string | null,
    public status: StatusTypeEnum,
    public pairCreatedDate: string,
    public startGameDate: string | null,
    public finishGameDate: string | null,
  ) {}
}

export type AnswerType = {
  questionId: number;
  answerStatus: string;
  addedAt: string;
};

export type OutputTypePair = {
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
  //  Array<{ id: string; body: string }> | null;
};
export type OutputTypePairToGetId = {
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
  //  Array<{ id: string; body: string }> | null;
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

export type updateTypeOfQuestion = {
  id: number;
  question: QuestionsEntity;
  player: PlayersEntity;
  answerStatus: StatusTypeEnumByAnswersToEndpoint;
  answer: string;
  addedAt: string;
};
export type updateTypeOfQuestion1 = {
  id: number;
  questionId: number;
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
//firstPlayerLogin: string;
//   scoreFirstPlayer: number;
// secondPlayerLogin: string | null;
//   scoreSecondPlayer: number;
