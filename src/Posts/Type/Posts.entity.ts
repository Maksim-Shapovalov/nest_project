import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  @OneToOne(() => BlogsEntity)
  @JoinColumn()
  blogId: number;
  @Column()
  blogName: string;
  @Column()
  createdAt: string;
}
@Entity()
export class PostsLikeEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => PostsEntity)
  @JoinColumn()
  postId: number;
  @Column()
  likesStatus: string;
  @OneToOne(() => UserEntity)
  @JoinColumn()
  userId: number;
  @Column()
  createdAt: string;
  @Column()
  login: string;
}
