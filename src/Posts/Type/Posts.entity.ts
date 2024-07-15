import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Column } from 'typeorm';
import { BlogsEntity } from '../../Blogs/Type/Blogs.entity';
import { UserEntity } from '../../Users/Type/User.entity';

@Entity()
export class PostsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @ManyToOne(() => BlogsEntity)
  @JoinColumn()
  blog: number;
  @Column()
  blogName: string;
  @Column()
  createdAt: string;
}
@Entity()
export class PostsLikeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => PostsEntity)
  @JoinColumn()
  post: number;
  @Column()
  likesStatus: string;
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: number;
  @Column()
  createdAt: string;
  @Column()
  login: string;
}
