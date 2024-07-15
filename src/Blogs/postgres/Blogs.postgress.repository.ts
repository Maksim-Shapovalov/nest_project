// import { InjectDataSource } from '@nestjs/typeorm';
// import { DataSource } from 'typeorm';
// import {
//   BlogsPaginationQueryType,
//   PaginationType,
// } from '../../qurey-repo/query-filter';
// import {
//   BlogClass,
//   BlogsOutputModel,
//   BlogsTypeSQL,
//   bodyForUpdateBlogs,
// } from '../Type/Blogs.type';
// import { Injectable } from '@nestjs/common';
//
// @Injectable()
// export class BlogsSQLRepository {
//   constructor(@InjectDataSource() protected dataSource: DataSource) {}
//   async getAllBlogs(
//     filter: BlogsPaginationQueryType,
//   ): Promise<PaginationType<BlogsOutputModel>> {
//     const filterQuery = filter.searchNameTerm;
//
//     const pageSizeInQuery: number = filter.pageSize;
//     const totalCountBlogs = await this.dataSource.query(
//       `SELECT COUNT(*) FROM "Blogs" WHERE LOWER("name") LIKE LOWER('%${filterQuery}%')`,
//     );
//
//     const totalCount = parseInt(totalCountBlogs[0].count);
//     const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
//     const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;
//
//     const res = await this.dataSource.query(
//       `SELECT * FROM "Blogs" WHERE LOWER("name") LIKE LOWER('%${filterQuery}%') ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT ${pageSizeInQuery} OFFSET ${pageBlog}`,
//     );
//
//     const items = res.map((b) => blogMapperSQL(b));
//     return {
//       pagesCount: pageCountBlogs,
//       page: filter.pageNumber,
//       pageSize: pageSizeInQuery,
//       totalCount: totalCount,
//       items: items,
//     };
//   }
//
//   async getBlogsById(id: number): Promise<BlogsOutputModel | null> {
//     const findCursor = await this.dataSource.query(
//       `SELECT * FROM "blogs_entity" WHERE "id" = ${id}`,
//     );
//     if (!findCursor[0]) return null;
//     return blogMapperSQL(findCursor[0]);
//   }
//   async saveBlog(blog: BlogClass): Promise<BlogsTypeSQL> {
//     const randomId = Math.floor(Math.random() * 1000000);
//     const saveBlogsQuery = `
//     INSERT INTO public."blogs_entity"(
//     id, name, description, "websiteUrl", "createdAt", "isMembership")
//     VALUES (${randomId}, '${blog.name}', '${blog.description}',
//     '${blog.websiteUrl}', '${blog.createdAt}', '${blog.isMembership}')
//     RETURNING *
//     `;
//     const result = await this.dataSource.query(saveBlogsQuery);
//     const newBlog = result.map((e) => {
//       return {
//         id: e.id,
//         name: e.name,
//         description: e.description,
//         websiteUrl: e.websiteUrl,
//         createdAt: e.createdAt,
//         isMembership: e.isMembership,
//       };
//     });
//     return newBlog;
//   }
//   async updateBlogById(blogs: bodyForUpdateBlogs): Promise<boolean> {
//     const findBlogQuery = await this.dataSource.query(
//       `SELECT * FROM "blogs_entity" WHERE "id" = '${blogs.id}'`,
//     );
//     if (findBlogQuery.length === 0) {
//       return null;
//     }
//     await this.dataSource.query(`
//     UPDATE "blogs_entity"
//     SET "name" = '${blogs.name}', "description" = '${blogs.description}', "websiteUrl" = '${blogs.websiteUrl}'
//     WHERE "id" = '${blogs.id}'
//     RETURNING * `);
//     return true;
//   }
//   async deleteBlogsById(id: number): Promise<boolean> {
//     const findBlogInDB = await this.dataSource.query(
//       `SELECT * FROM "blogs_entity" WHERE "id" = ${id}`,
//     );
//     if (!findBlogInDB[0]) return false;
//     const findBlog = await this.dataSource.query(
//       `DELETE FROM public."blogs_entity" WHERE "id" = ${id} ;`,
//     );
//     if (findBlog[1] > 0) return true;
//   }
//   async deletePostInBlogById(blogId: number, postId: number): Promise<boolean> {
//     const findBlogInDB = await this.dataSource.query(
//       `SELECT * FROM "posts_entity" WHERE id = ${postId} AND "blogId" = ${blogId}`,
//     );
//     if (!findBlogInDB[0]) return false;
//     const findBlog = await this.dataSource.query(
//       `DELETE FROM public."posts_entity" WHERE id = ${postId} AND "blogId" = ${blogId} ;`,
//     );
//     if (findBlog[1] > 0) return true;
//   }
// }
// export const blogMapperSQL = (blog: BlogsTypeSQL): BlogsOutputModel => {
//   return {
//     id: blog.id.toString(),
//     name: blog.name,
//     description: blog.description,
//     websiteUrl: blog.websiteUrl,
//     createdAt: blog.createdAt,
//     isMembership: blog.isMembership,
//   };
// };
