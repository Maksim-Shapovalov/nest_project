import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { BlogsEntity } from '../../blogs/domain/Blogs.entity';
import { UserEntity } from '../../users/domain/User.entity';

@Entity()
export class PostsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @ManyToOne(() => BlogsEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: BlogsEntity;
  @Column()
  blogId: string;
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: string;
  @Column()
  blogName: string;
  @Column()
  createdAt: string;
}
@Entity()
export class PostsLikeEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @ManyToOne(() => PostsEntity)
  @JoinColumn()
  post: string;
  @Column()
  likesStatus: string;
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
  @Column()
  createdAt: string;
  @Column()
  login: string;
}
