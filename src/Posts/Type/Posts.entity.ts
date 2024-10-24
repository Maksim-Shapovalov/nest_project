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
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;
  @Column()
  shortDescription: string;
  @Column()
  content: string;
  @ManyToOne(() => BlogsEntity)
  @JoinColumn()
  blogId: string;
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
  user: string;
  @Column()
  createdAt: string;
  @Column()
  login: string;
}
