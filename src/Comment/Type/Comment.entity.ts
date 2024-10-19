import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  @ManyToOne(() => PostsEntity)
  @JoinColumn()
  postId: PostsEntity;
  @Column()
  createdAt: string;
}
@Entity()
export class CommentLikeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => CommentEntity)
  @JoinColumn({ name: 'commentId' })
  comment: CommentEntity;
  @Column()
  likesStatus: string;
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
}
