import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { UserEntity } from '../../users/domain/User.entity';
import { BlogsOutputClassWithSA, BlogsOutputModel } from './Blogs.type';

@Entity()
export class BlogsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column()
  description: string;
  @Column()
  websiteUrl: string;
  @Column()
  createdAt: string;
  @Column()
  isMembership: boolean;
  @ManyToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;
  @Column()
  userId: string;

  static ViewModelBlogs(blog: BlogsEntity): BlogsOutputModel {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
  static ViewModelBlogsBySuperAdmin(blog: BlogsEntity): BlogsOutputClassWithSA {
    return {
      id: blog.id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.userId ? blog.userId : null,
        userLogin: blog.user ? blog.user.login : null,
      },
    };
  }
}
