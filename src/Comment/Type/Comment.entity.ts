import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Column } from 'typeorm';
import { UserEntity } from '../../Users/Type/User.entity';
import { PostsEntity } from '../../Posts/Type/Posts.entity';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  content: string;
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
  @Column()
  userLogin: string;
  @OneToOne(() => PostsEntity)
  @JoinColumn()
  post: PostsEntity;
  @Column()
  createdAt: string;
}
@Entity()
export class CommentLikeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => PostsEntity)
  @JoinColumn()
  comment: number;
  @Column()
  likesStatus: string;
  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: number;
}
