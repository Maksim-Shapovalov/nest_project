import { BlogClass, BlogsOutputModel, BlogsType } from './Type/Blogs.type';
import { ObjectId, WithId } from 'mongodb';
import {
  BlogsPaginationQueryType,
  PaginationType,
} from '../qurey-repo/query-filter';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, UserDocument } from './Type/Blogs.schemas';

@injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) protected blogModel: Model<UserDocument>,
  ) {}
  async getAllBlogs(
    filter: BlogsPaginationQueryType,
  ): Promise<PaginationType<BlogsOutputModel>> {
    const filterQuery = {
      name: { $regex: filter.searchNameTerm, $options: 'i' },
    };

    const pageSizeInQuery: number = filter.pageSize;
    const totalCountBlogs = await this.blogModel.countDocuments(filterQuery);

    const pageCountBlogs: number = Math.ceil(totalCountBlogs / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;
    const res = await this.blogModel
      .find(filterQuery)
      .sort({ [filter.sortBy]: filter.sortDirection })
      .skip(pageBlog)
      .limit(pageSizeInQuery)
      .lean();

    const items = res.map((b) => blogMapper(b));
    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCountBlogs,
      items: items,
    };
  }
  async getBlogsById(id: string): Promise<BlogsOutputModel | null> {
    if (!ObjectId.isValid(id)) return null;
    const findCursor = await this.blogModel.findOne({ _id: new ObjectId(id) });
    if (!findCursor) return null;
    return blogMapper(findCursor);
  }
  async saveBlog(blog: BlogClass): Promise<BlogsType> {
    return this.blogModel.create(blog);
  }
  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const res = await this.blogModel.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: name,
          description: description,
          websiteUrl: websiteUrl,
        },
      },
    );
    return res.matchedCount === 1;
  }
  async deleteBlogsById(id: string): Promise<boolean> {
    const findBlog = await this.blogModel.deleteOne({ _id: new ObjectId(id) });
    return findBlog.deletedCount === 1;
  }
}
export const blogMapper = (blog: WithId<BlogsType>): BlogsOutputModel => {
  return {
    id: blog._id.toHexString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
};
