import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizGameEntityNotPlayerInfo } from './QuizGame.entity';

@Entity()
export class QuestionsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  body: string;
  @Column('text', { array: true })
  correctAnswers: [string];
  @Column({ default: false })
  published: boolean;
  @Column()
  createdAt: string;
  @Column({ default: null })
  updatedAt: string | null;
}

export type QuestionTypeOnMapper = {
  id: number;
  body: string;
};

@Entity()
export class QuestionGame {
  @ManyToOne(() => QuizGameEntityNotPlayerInfo)
  gameId: number;
  @ManyToOne(() => QuestionsEntity)
  questionId: number;
}
