import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuestionsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  body: string;
  @Column('text', { array: true })
  correctAnswers: string[];
  @Column({ default: false })
  published: boolean;
  @Column()
  createdAt: string;
  @Column()
  updatedAt: string | null;
}

export type QuestionTypeOnMapper = {
  id: number;
  body: string;
};
