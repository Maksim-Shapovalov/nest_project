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

enum StatusTypeEnum {
  Active = 'Active',
  Finished = 'Finished',
  PendingSecondPlayer = 'PendingSecondPlayer',
}
@Entity()
export class QuizGameEntityNotPlayerInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => PlayersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firstPlayer' })
  firstPlayer: PlayersEntity;

  @Column()
  firstPlayerId: string;

  @ManyToOne(() => PlayersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'secondPlayer' })
  secondPlayer: PlayersEntity | null;

  @Column({ default: null })
  secondPlayerId: string | null;
  @Column()
  status: StatusTypeEnum;
  @Column()
  pairCreatedDate: string;
  @Column({ default: null })
  startGameDate: string | null;
  @Column({ default: null })
  finishGameDate: string | null;
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
  @Column()
  questionId: number;
  @ManyToOne(() => PlayersEntity, (player) => player.answers, {
    onDelete: 'CASCADE',
  })
  player: PlayersEntity;
  @Column()
  playerId: string;
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
