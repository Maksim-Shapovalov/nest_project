import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  BlogsPaginationQueryType,
  PaginationType,
} from '../../qurey-repo/query-filter';
import {
  BlogClass,
  BlogsOutputModel,
  BlogsTypeSQL,
  bodyForUpdateBlogs,
} from '../Type/Blogs.type';
import { Injectable } from '@nestjs/common';
import { QuestionsEntity } from '../../quiz/entity/Questions.Entity';
import { BlogsEntity } from '../Type/Blogs.entity';
import { PostsEntity } from '../../Posts/Type/Posts.entity';

@Injectable()
export class BlogsSQLTypeOrmRepository {
  constructor(
    @InjectRepository(BlogsEntity)
    protected blogsRepository: Repository<BlogsEntity>,
    @InjectRepository(PostsEntity)
    protected postsRepository: Repository<PostsEntity>,
  ) {}
  async getAllBlogs(
    filter: BlogsPaginationQueryType,
  ): Promise<PaginationType<BlogsOutputModel>> {
    const filterQuery = filter.searchNameTerm;

    const pageSizeInQuery: number = filter.pageSize;
    const totalCountBlogs = await this.blogsRepository
      .createQueryBuilder('blog')
      .where('LOWER(blog.name) LIKE LOWER(:filterQuery)', {
        filterQuery: `%${filterQuery}%`,
      })
      .getCount();
    const totalCount = parseInt(totalCountBlogs.toString());
    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const res = await this.blogsRepository
      .createQueryBuilder('blog')
      .where('LOWER(blog.name) LIKE LOWER(:filterQuery)', {
        filterQuery: `%${filterQuery}%`,
      })
      .orderBy(
        `blog.${filter.sortBy}`,
        filter.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(pageSizeInQuery)
      .skip(pageBlog)
      .getMany();
    const items = res.map((b) => blogMapperSQL(b));
    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCount,
      items: items,
    };
  }

  async getBlogsById(id: number): Promise<BlogsOutputModel | null> {
    const findCursor = await this.blogsRepository.find({ where: { id: id } });
    if (!findCursor) return null;
    return blogMapperSQL(findCursor[0]);
  }
  async saveBlog(blog: BlogClass): Promise<BlogsOutputModel> {
    const newBlogs = await this.blogsRepository.create({
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    });
    const result = await this.blogsRepository.save(newBlogs);
    return blogMapperSQL(result);
  }
  async updateBlogById(blogs: bodyForUpdateBlogs): Promise<boolean> {
    const findBlogQuery = await this.blogsRepository.find({
      where: { id: +blogs.id },
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
  async deleteBlogsById(id: number): Promise<boolean> {
    const findBlogInDB = await this.blogsRepository.find({ where: { id: id } });
    if (!findBlogInDB[0]) return false;

    const deleteResult = await this.blogsRepository.delete(id);
    if (deleteResult.affected > 0) return true;
    return false;
  }
  async deletePostInBlogById(blogId: number, postId: number): Promise<boolean> {
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
export const blogMapperSQL = (blog: BlogsTypeSQL): BlogsOutputModel => {
  return {
    id: blog.id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
};
