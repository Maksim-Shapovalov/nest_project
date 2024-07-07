import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Column } from 'typeorm';
import { UserEntity } from '../../Users/Type/User.entity';

@Entity()
export class DeviceEntity {
  @PrimaryGeneratedColumn()
  deviceId: number;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: string;
  @Column()
  iat: number;
  @Column()
  exp: number;
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
}
