import { injectable } from 'inversify';
import 'reflect-metadata';

import { NotFoundException } from '@nestjs/common';

import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginationQueryType } from '../../qurey-repo/query-filter';
import { BlogsSQLRepository } from '../../Blogs/postgres/Blogs.postgress.repository';
import { AvailableStatusEnum } from '../../Comment/Type/Comment.type';
import { PostClass, PostsOutputSQLType } from '../Type/Posts.type';

@injectable()
export class PostsPostgresRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected blogsSQLRepository: BlogsSQLRepository,
  ) {}
  async getAllPosts(filter: PaginationQueryType) {
    const pageSizeInQuery: number = filter.pageSize;
    const totalCountPosts = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Posts"`,
    );

    const totalCount = parseInt(totalCountPosts[0].count);
    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.dataSource.query(
      `SELECT * FROM "Posts" 
      ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT 
      ${pageSizeInQuery} OFFSET ${pageBlog}`,
    );
    // const items = result.map((p) => postsLikeMapper(p,userId))
    const itemsPromises = result.map((p) => postsLikeSQLMapper(p));
    const items = await Promise.all(itemsPromises);
    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCount,
      items: items,
    };
  }

  async getPostsById(id: number) {
    const findPosts = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE id = ${id}`,
    );

    if (!findPosts) {
      return null;
    }
    return postsLikeSQLMapper(findPosts[0]);
  }

  async getPostInBlogs(blogId: number, filter: PaginationQueryType) {
    const findBlog = await this.blogsSQLRepository.getBlogsById(blogId);
    if (!findBlog) {
      return null;
    }

    const filterQuery = { blogId: findBlog[0].id };

    const pageSizeInQuery: number = filter.pageSize;
    const totalCount = parseInt(findBlog[0].count);

    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE "blogId" = ${filterQuery} 
      ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT 
      ${pageSizeInQuery} OFFSET ${pageBlog}`,
    );
    // const items = res.map((p) => postsLikeMapper(p,null))
    const itemsPromises = result.map((p) => {
      return postsLikeSQLMapper(p);
    });
    const items = await Promise.all(itemsPromises);

    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCount,
      items: items,
    };
  }
  // async updateStatusLikeUser(
  //   postId: string,
  //   userId: number,
  //   status: AvailableStatusEnum,
  // ) {
  //   const likeWithUserId = await this.postLikeModel
  //     .findOne({
  //       userId: userId,
  //       postId: postId,
  //     })
  //     .exec();
  //   const findUser = await this.userRepository.getUserById(userId);
  //   const comment = await this.postModel
  //     .findOne({
  //       _id: new ObjectId(postId),
  //     })
  //     .exec();
  //
  //   if (!comment) {
  //     return false;
  //   }
  //
  //   if (likeWithUserId) {
  //     const updateStatus = await this.postLikeModel.updateOne(
  //       { postId: postId, userId: userId },
  //       {
  //         $set: {
  //           likesStatus: status,
  //         },
  //       },
  //     );
  //     if (!updateStatus) throw new NotFoundException();
  //
  //     return updateStatus.matchedCount === 1;
  //   }
  //
  //   await this.postLikeModel.create({
  //     postId,
  //     userId: userId,
  //     likesStatus: status,
  //     createdAt: new Date().toISOString(),
  //     login: findUser.login,
  //   });
  //
  //   return true;
  // }

  async savePost(post: PostClass) {
    const randomId = Math.floor(Math.random() * 1000000);
    // await this.postsLikeMapper(post, null);
    const newPost = `INSERT INTO public."Posts"(
      id, content, "createdAt", title, "shortDescription", "blogId", "blogName")
    VALUES (${randomId}, '${post.content}', '${post.createdAt}', '${post.title}', '${post.shortDescription}', '${post.blogId}', '${post.blogName}')
    RETURNING *`;
    const result = await this.dataSource.query(newPost);
    return postsLikeSQLMapper(result[0]);
  }

  async updatePostsById(
    id: number,
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
  ): Promise<boolean> {
    const findPostQuery = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE "id" = ${id}`,
    );
    if (findPostQuery.length === 0) {
      return null;
    }

    await this.dataSource.query(`
    UPDATE "Posts"
    SET "title" = '${title}', "shortDescription" = '${shortDescription}', "content" = '${content}', "blogId" = ${blogId}
    WHERE "id" = '${id}'
    RETURNING * `);
    return true;
  }

  async deletePostsById(id: number): Promise<boolean> {
    const findPostInDB = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE id = ${id}`,
    );
    if (!findPostInDB[0]) return false;
    const findPost = await this.dataSource.query(
      `DELETE FROM public."Posts" WHERE "id" = ${id} ;`,
    );
    if (findPost[1] > 0) return true;
  }

  //   async postsLikeMapper(post: any, userId: number | null) {
  //     const likeCount = await this.dataSource.query(
  //       `SELECT COUNT(*) FROM "Posts" WHERE LOWER("id") = post.id AND LOWER("email") LIKE LOWER('%${searchEmailTerm}%')`,
  //     );
  //
  //     await this.postLikeModel.countDocuments({
  //       likesStatus: AvailableStatusEnum.like,
  //       postId: post._id.toString(),
  //     });
  //     const dislikeCount = await this.postLikeModel.countDocuments({
  //       likesStatus: AvailableStatusEnum.dislike,
  //       postId: post._id.toString(),
  //     });
  //
  //     const myStatus = await this.postLikeModel
  //       .findOne({
  //         userId: userId,
  //         postId: post._id.toString(),
  //       })
  //       .exec();
  //     const findThreeLastUser = await this.postLikeModel
  //       .find({
  //         likesStatus: { $all: ['Like'] },
  //         postId: post._id.toString(),
  //       })
  //       .sort({ createdAt: -1 })
  //       .limit(3)
  //       .exec();
  //
  //     return {
  //       id: post._id.toHexString(),
  //       title: post.title,
  //       shortDescription: post.shortDescription,
  //       content: post.content,
  //       blogId: post.blogId,
  //       blogName: post.blogName,
  //       createdAt: post.createdAt,
  //       extendedLikesInfo: {
  //         likesCount: +likeCount, //+likeCount
  //         dislikesCount: +dislikeCount, //+dislikeCount
  //         myStatus: myStatus ? myStatus.likesStatus : 'None', //myStatus ? myStatus.likesStatus : 'None'
  //         newestLikes: findThreeLastUser.map((r) => ({
  //           addedAt: r.createdAt,
  //           userId: r.userId,
  //           login: r.login,
  //         })), //findThreeLastUser.map(UserDbType.UserInReqMapper)
  //       },
  //     };
  //   }
}
export const postsLikeSQLMapper = (post: PostsOutputSQLType) => {
  return {
    id: post.id.toString(),
    shortDescription: post.shortDescription,
    blogId: post.blogId.toString(),
    blogName: post.blogName,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      dislikesCount: 0,
      likesCount: 0,
      myStatus: 'None',
      newestLikes: 'None',
    },
  };
};
