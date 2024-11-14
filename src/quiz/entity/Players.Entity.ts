import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnswersEntity, QuizGameEntityNotPlayerInfo } from './QuizGame.entity';
import { UserEntity } from '../../Users/Type/User.entity';

@Entity()
export class PlayersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: UserEntity;
  @Column()
  userId: string;
  @ManyToOne(() => QuizGameEntityNotPlayerInfo, { onDelete: 'CASCADE' })
  game: QuizGameEntityNotPlayerInfo;
  @Column()
  login: string;
  @Column()
  score: number;
  @OneToMany(() => AnswersEntity, (answer) => answer.player, {
    onDelete: 'CASCADE',
  })
  answers: AnswersEntity[];
}

export type findingPlayer = {
  id: string;
  login: string;
  userId: string;
  score: number;
  answers: AnswersEntity[];
};
