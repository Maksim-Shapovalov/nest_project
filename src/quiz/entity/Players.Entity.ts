import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AnswersEntity } from './QuizGame.entity';

@Entity()
export class PlayersEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  login: string;
  @Column()
  score: number;
  @OneToMany(() => AnswersEntity, (answer) => answer.player)
  answers: AnswersEntity[];
}

export type findingPlayer = {
  id: number;
  login: string;
  score: number;
  answers: AnswersEntity[];
};
