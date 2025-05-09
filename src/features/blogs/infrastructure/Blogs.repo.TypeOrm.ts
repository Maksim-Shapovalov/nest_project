import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BlogsPaginationQueryType,
  PaginationType,
} from '../../validate-middleware/query-filter';
import {
  BlogClass,
  BlogsOutputClassWithSA,
  BlogsOutputModel,
  bodyForUpdateBlogs,
} from '../domain/Blogs.type';
import { Injectable } from '@nestjs/common';
import { BlogsEntity } from '../domain/Blogs.entity';
import { PostsEntity } from '../../post/domain/Posts.entity';
import { UserEntity } from '../../users/domain/User.entity';
import { NewestPostLike } from '../../users/domain/User.type';

@Injectable()
export class BlogsSQLTypeOrmRepository {
  constructor(
    @InjectRepository(BlogsEntity)
    protected blogsRepository: Repository<BlogsEntity>,
    @InjectRepository(PostsEntity)
    protected postsRepository: Repository<PostsEntity>,
    @InjectRepository(UserEntity)
    protected userRepository: Repository<UserEntity>,
  ) {}
  async getAllBlogs(
    filter: BlogsPaginationQueryType,
    userModel?: NewestPostLike | null,
    path?: string,
  ): Promise<PaginationType<BlogsOutputModel | BlogsOutputClassWithSA>> {
    const filterQuery = filter.searchNameTerm;

    const pageSizeInQuery: number = filter.pageSize;
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;
    const totalBlogs = await this.blogsRepository
      .createQueryBuilder('blog')
      .where('LOWER(blog.name) LIKE LOWER(:filterQuery)', {
        filterQuery: `%${filterQuery}%`,
      })
      .getMany();

    const queryBuilder123 = this.blogsRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.user', 'user')
      .where('LOWER(blog.name) LIKE LOWER(:filterQuery)', {
        filterQuery: `%${filterQuery}%`,
      });

    if (userModel && userModel.userId) {
      queryBuilder123.andWhere('blog.userId = :userId', {
        userId: userModel.userId,
      });
    } else {
      queryBuilder123.andWhere('1=1');
    }

    const res = await queryBuilder123
      .orderBy(
        `blog.${filter.sortBy}`,
        filter.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(pageSizeInQuery)
      .skip(pageBlog)
      .getMany();

    const totalCount = parseInt(totalBlogs.length.toString());
    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);

    if (path) {
      const items = res.map((b) => {
        return BlogsEntity.ViewModelBlogsBySuperAdmin(b);
      });
      return {
        pagesCount: pageCountBlogs,
        page: filter.pageNumber,
        pageSize: pageSizeInQuery,
        totalCount: totalCount,
        items: items,
      };
    } else {
      const totalBlogs = await this.blogsRepository
        .createQueryBuilder('blog')
        .where('LOWER(blog.name) LIKE LOWER(:filterQuery)', {
          filterQuery: `%${filterQuery}%`,
        })
        .andWhere('blog.userId = :userId', {
          userId: userModel.userId,
        })
        .getMany();
      const totalCount = parseInt(totalBlogs.length.toString());
      const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
      const items = res.map((b) => BlogsEntity.ViewModelBlogs(b));
      return {
        pagesCount: pageCountBlogs,
        page: filter.pageNumber,
        pageSize: pageSizeInQuery,
        totalCount: totalCount,
        items: items,
      };
    }
  }

  async getBlogsById(id: string): Promise<BlogsOutputModel | null> {
    const findCursor = await this.blogsRepository.findOne({
      where: { id: id },
    });
    if (!findCursor) return null;
    return BlogsEntity.ViewModelBlogs(findCursor);
  }
  async getBlogForMiddleware(id: string): Promise<BlogsEntity | null> {
    const findCursor = await this.blogsRepository.findOne({
      where: { id: id },
    });
    if (!findCursor) return null;
    return findCursor;
  }
  async saveBlog(blog: BlogClass): Promise<BlogsOutputModel> {
    const ownerBlog = await this.userRepository.findOne({
      where: { id: blog.userId },
    });
    const newBlogs = await this.blogsRepository.create({
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      user: ownerBlog,
      userId: blog.userId,
    });
    const result = await this.blogsRepository.save(newBlogs);
    return BlogsEntity.ViewModelBlogs(result);
  }

  async updateBlogById(blogs: bodyForUpdateBlogs): Promise<boolean> {
    const findBlogQuery = await this.blogsRepository.find({
      where: { id: blogs.id },
    });
    if (findBlogQuery.length === 0) {
      return null;
    }
    await this.blogsRepository.update(blogs.id, {
      description: blogs.description,
      websiteUrl: blogs.websiteUrl,
      name: blogs.name,
    });
    return true;
  }
  async deleteBlogsById(id: string): Promise<boolean> {
    const findBlogInDB = await this.blogsRepository.find({ where: { id: id } });
    if (!findBlogInDB[0]) return false;

    const deleteResult = await this.blogsRepository.delete(id);
    if (deleteResult.affected > 0) return true;
    return false;
  }
  async deletePostInBlogById(blogId: string, postId: string): Promise<boolean> {
    const post = await this.postsRepository.findOne({
      where: { id: postId, blogId: blogId },
    });
    if (!post) return false;
    const result = await this.postsRepository.delete({
      id: postId,
      blogId: blogId,
    });
    if (result.affected > 0) return true;
    return false;
  }
}
