import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnswersEntity, QuizGameEntityNotPlayerInfo } from './QuizGame.entity';
import { UserEntity } from '../../Users/Type/User.entity';

@Entity()
export class PlayersEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => UserEntity)
  user: UserEntity;
  @ManyToOne(() => QuizGameEntityNotPlayerInfo)
  game: QuizGameEntityNotPlayerInfo;
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
