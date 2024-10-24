import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  login: string;
  @Column()
  email: string;
  @Column()
  passwordHash: string;
  @Column()
  passwordSalt: string;
  @Column()
  createdAt: string;
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: string;
  @Column({ default: false })
  isConfirmed: boolean;
  @Column()
  recoveryCode: string;
}
