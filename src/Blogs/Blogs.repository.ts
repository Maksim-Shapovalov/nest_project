import { BlogClass, BlogsOutputModel, BlogsType } from './Type/Blogs.type';
import { ObjectId, WithId } from 'mongodb';
import {
  BlogsPaginationQueryType,
  PaginationType,
} from '../qurey-repo/query-filter';
import { BlogModelClass } from './Type/Blogs.schemas';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class BlogsRepository {
  async getAllBlogs(
    filter: BlogsPaginationQueryType,
  ): Promise<PaginationType<BlogsOutputModel>> {
    const filterQuery = {
      name: { $regex: filter.searchNameTerm, $options: 'i' },
    };

    const pageSizeInQuery: number = filter.pageSize;
    const totalCountBlogs = await BlogModelClass.countDocuments(filterQuery);

    const pageCountBlogs: number = Math.ceil(totalCountBlogs / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;
    const res = await BlogModelClass.find(filterQuery)
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
    const findCursor = await BlogModelClass.findOne({ _id: new ObjectId(id) });
    if (!findCursor) return null;
    return blogMapper(findCursor);
  }
  async saveBlog(blog: BlogClass): Promise<BlogsType> {
    return BlogModelClass.create(blog);
  }
  async updateBlogById(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const res = await BlogModelClass.updateOne(
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
    const findBlog = await BlogModelClass.deleteOne({ _id: new ObjectId(id) });
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
