import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { UserEntity } from '../../users/domain/User.entity';

@Entity()
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  deviceId: string;
  @Column()
  ip: string;
  @Column()
  title: string;
  @Column()
  lastActiveDate: Date;
  @Column({ default: null })
  iat: Date | null;
  @Column({ default: null })
  exp: Date | null;
  @Column()
  userId: string;
  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn()
  user: UserEntity;
}
