import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { UserEntity } from '../../users/domain/User.entity';
import { PostsEntity } from '../../post/domain/Posts.entity';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
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
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => CommentEntity)
  @JoinColumn({ name: 'commentId' })
  comment: CommentEntity;
  @Column()
  likesStatus: string;
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
}
