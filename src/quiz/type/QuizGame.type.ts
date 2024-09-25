import { QuestionsEntity } from '../entity/Questions.Entity';
import { Column, ManyToOne, OneToOne } from 'typeorm';
import { PlayersEntity } from '../entity/Players.Entity';
import { StatusTypeEnumByAnswers } from '../entity/QuizGame.entity';

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
      id: string;
      login: string;
    };
    score: number;
  };
  questions: QuestionsEntity;
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
type StatusTypeEnum = 'PendingSecondPlayer' | 'Active' | 'Finished';

export type updateTypeOfQuestion = {
  questionId: number;
  playerId: PlayersEntity;
  answerStatus: StatusTypeEnumByAnswers;
  answer: string;
  addedAt: string;
};
export type QuizGameInDB = {
  id: number;
  firstPlayerId: number;
  secondPlayerId: number | null;
  question: QuestionsEntity | null;
  status: StatusTypeEnum;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
};
//firstPlayerLogin: string;
//   scoreFirstPlayer: number;
// secondPlayerLogin: string | null;
//   scoreSecondPlayer: number;
