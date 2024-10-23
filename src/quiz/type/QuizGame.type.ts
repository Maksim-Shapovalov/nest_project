import { QuestionsEntity } from '../entity/Questions.Entity';
import { Column, ManyToOne, OneToOne } from 'typeorm';
import { PlayersEntity } from '../entity/Players.Entity';
import {
  StatusTypeEnumByAnswers,
  StatusTypeEnumByAnswersToEndpoint,
} from '../entity/QuizGame.entity';
import { questBodyToOutput1 } from './question.type';

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
    public firstPlayerId: number,
    public secondPlayerId: number | null,
    public status: StatusTypeEnum,
    public pairCreatedDate: string,
    public startGameDate: string,
    public finishGameDate: string,
  ) {}
}

export type AnswerType = {
  questionId: string;
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
  id: number;
  firstPlayer: PlayersEntity;
  firstPlayerId: number;
  secondPlayer: PlayersEntity | null;
  secondPlayerId: number | null;
  question: questBodyToOutput1[] | [];
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
export type QuizGameInDB = {
  id: number;
  firstPlayerId: number;
  secondPlayerId: number | null;
  status: StatusTypeEnum;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
};
//firstPlayerLogin: string;
//   scoreFirstPlayer: number;
// secondPlayerLogin: string | null;
//   scoreSecondPlayer: number;
