import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { UserEntity } from '../../Users/Type/User.entity';

@Entity()
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: string;
  @Column({ default: null })
  iat: number | null;
  @Column({ default: null })
  exp: number | null;
  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn()
  user: UserEntity;
}
