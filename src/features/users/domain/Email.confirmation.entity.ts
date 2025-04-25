import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './User.entity';

@Entity()
export class EmailConfirmationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  userId: string;
  @OneToOne(() => UserEntity, (user) => user.emailConfirmation)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;
  @Column({ default: false })
  isConfirmed: boolean;
}
