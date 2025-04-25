import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Column } from 'typeorm';
import { EmailConfirmationEntity } from './Email.confirmation.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  createdAt: Date;
  @OneToOne(
    () => EmailConfirmationEntity,
    (emailConfirmation) => emailConfirmation.user,
    { onDelete: 'CASCADE' },
  )
  emailConfirmation: EmailConfirmationEntity;
  @Column({ nullable: true })
  recoveryCode: string;
  @Column({ default: false })
  isBanned: boolean;
  @Column({ default: null })
  banReason: string | null;
}
