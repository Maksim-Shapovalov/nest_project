import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { UserEntity } from '../../Users/Type/User.entity';

@Entity()
export class DeviceEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: string;
  @Column()
  deviceId: string;
  @OneToOne(() => UserEntity)
  @JoinColumn()
  userId: UserEntity;
}
