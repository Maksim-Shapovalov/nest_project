import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayersEntity } from './Players.Entity';
import { QuestionsEntity } from './Questions.Entity';

// @Entity()
// export class QuizGameEntity {
//   @PrimaryGeneratedColumn()
//   id: number;
//   @ManyToMany(() => UserEntity)
//   @JoinColumn()
//   firstPlayer: number;
//   @JoinColumn()
//   firstPlayerLogin: string;
//   // @OneToMany(() => UserEntity)
//   // firstPlayerAnswer: string;
//   @JoinColumn()
//   scoreFirstPlayer: number;
//   @ManyToMany(() => UserEntity)
//   @JoinColumn()
//   secondPlayer: number;
//   @JoinColumn()
//   secondPlayerLogin: string;
//   @JoinColumn()
//   scoreSecondPlayer: number;
//   @ManyToMany(() => AnswersEntity)
//   @JoinColumn()
//   question: number | null;
//   @Column()
//   status: string;
//   @Column()
//   pairCreatedDate: string;
//   @Column()
//   startGameDate: string;
//   @Column()
//   finishGameDate: string;
// }
@Entity()
export class QuizGameEntityNotPlayerInfo {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => PlayersEntity)
  @JoinColumn({ name: 'firstPlayerId' })
  firstPlayerId: number;
  @ManyToOne(() => PlayersEntity)
  @JoinColumn({ name: 'secondPlayerId' })
  secondPlayer: number | null;
  @Column()
  status: string;
  @Column()
  pairCreatedDate: string;
  @Column()
  startGameDate: string;
  @Column()
  finishGameDate: string;
}
@Entity()
export class AnswersEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => QuestionsEntity)
  question: number;
  @ManyToOne(() => PlayersEntity, (player) => player.answers)
  player: PlayersEntity;
  @Column()
  answerStatus: StatusTypeEnumByAnswers;
  @Column()
  answer: string;
  @Column()
  addedAt: string;
}

export type StatusTypeEnumByAnswers = 'Correct, Incorrect';
export enum StatusTypeEnumByAnswersToEndpoint {
  correct = 'Correct',
  incorrect = 'Incorrect',
}
