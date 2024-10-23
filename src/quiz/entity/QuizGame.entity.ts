import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
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
enum StatusTypeEnum {
  Active = 'Active',
  Finished = 'Finished',
  PendingSecondPlayer = 'PendingSecondPlayer',
}
@Entity()
export class QuizGameEntityNotPlayerInfo {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => PlayersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firstPlayer' })
  firstPlayer: PlayersEntity;

  @Column()
  firstPlayerId: number;

  @ManyToOne(() => PlayersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'secondPlayer' })
  secondPlayer: PlayersEntity | null;

  @Column({ default: null })
  secondPlayerId: number | null;
  @Column()
  status: StatusTypeEnum;
  @Column()
  pairCreatedDate: string;
  @Column()
  startGameDate: string;
  @Column()
  finishGameDate: string;
  @ManyToMany(() => QuestionsEntity, (question) => question.quizGames)
  @JoinTable({ name: 'quiz_game_questions' })
  question: QuestionsEntity[] | null;
}
@Entity()
export class AnswersEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => QuestionsEntity)
  question: QuestionsEntity;
  @ManyToOne(() => PlayersEntity, (player) => player.answers, {
    onDelete: 'CASCADE',
  })
  player: PlayersEntity;
  @Column()
  answerStatus: StatusTypeEnumByAnswersToEndpoint;
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
