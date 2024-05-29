import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginationQueryType } from '../../qurey-repo/query-filter';
import {
  BodyUpdatingPost,
  PostClass,
  PostsOutputSQLType,
} from '../Type/Posts.type';
import { AvailableStatusEnum } from '../../Comment/Type/Comment.type';
import { UserSQLRepository } from '../../Users/User.SqlRepositories';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsPostgresRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected userSQLRepository: UserSQLRepository,
  ) {}
  async getAllPosts(filter: PaginationQueryType, userId: number | null) {
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
    const itemsPromises = result.map((p) => this.postsLikeMapper(p, userId));
    const items = await Promise.all(itemsPromises);
    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCount,
      items: items,
    };
  }

  async getPostsById(id: number, userId: any | null) {
    const findPosts = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE id = ${id}`,
    );

    if (!findPosts[0]) {
      return null;
    }
    return this.postsLikeMapper(findPosts[0], +userId.userId || null);
  }

  async getPostInBlogs(
    blogId: number,
    filter: PaginationQueryType,
    userId: number,
  ) {
    const totalCountPosts = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Posts" WHERE "blogId" = ${blogId}`,
    );

    const pageSizeInQuery: number = filter.pageSize;
    const totalCount = parseInt(totalCountPosts[0].count);

    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE "blogId" = ${blogId} 
      ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT 
      ${pageSizeInQuery} OFFSET ${pageBlog}`,
    );
    // const items = res.map((p) => postsLikeMapper(p,null))
    const itemsPromises = result.map((p) => {
      return this.postsLikeMapper(p, userId);
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
  async updateStatusLikeUser(
    postId: number,
    userId: number,
    status: AvailableStatusEnum,
  ) {
    const randomId = Math.floor(Math.random() * 1000000);
    const likeWithUserId = await this.dataSource.query(
      `SELECT * FROM "Posts-like" WHERE "postId" = ${postId} AND "userID" = ${userId}`,
    );
    const findUser = await this.userSQLRepository.getUserById(userId);
    const comment = await this.getPostsById(postId, userId);

    if (!comment) {
      return false;
    }

    if (likeWithUserId[0]) {
      const updateStatus = await this.dataSource.query(
        `UPDATE * FROM "Posts-like" SET "likesStatus"= ${status}
	      WHERE "postId" = ${postId} AND "userID" = ${userId};`,
      );
      if (!updateStatus) return null;

      return updateStatus.matchedCount === 1;
    } else {
      await this.dataSource.query(`INSERT INTO public."Posts-like"(
        id, "postId", "userId", login, "createdAt", "likesStatus")
        VALUES (${randomId},${postId}, ${userId}, '${findUser.login}', '${new Date().toISOString()}', '${status}');`);
      return true;
    }
  }

  async savePost(post: PostClass, userId: number) {
    const randomId = Math.floor(Math.random() * 1000000);
    // await this.postsLikeMapper(post, null);
    const newPost = `INSERT INTO public."Posts"(
      id, content, "createdAt", title, "shortDescription", "blogId", "blogName")
    VALUES (${randomId}, '${post.content}', '${post.createdAt}', '${post.title}', '${post.shortDescription}', '${post.blogId}', '${post.blogName}')
    RETURNING *`;
    const result = await this.dataSource.query(newPost);
    return this.postsLikeMapper(result[0], userId);
  }

  async updatePostsById(postBody: BodyUpdatingPost): Promise<boolean> {
    const findPostQuery = await this.dataSource.query(
      `SELECT * FROM "Posts" WHERE "id" = ${postBody.postId} AND "blogId" = ${postBody.blogId}`,
    );
    if (findPostQuery.length === 0) {
      return null;
    }

    await this.dataSource.query(`
    UPDATE "Posts"
    SET "title" = '${postBody.title}', "shortDescription" = '${postBody.shortDescription}', "content" = '${postBody.content}', "blogId" = ${postBody.blogId}
    WHERE "id" = '${postBody.postId}'
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

  async postsLikeMapper(post: any, userId: number | null) {
    const likeCount = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Posts-like" WHERE "likesStatus" = '${AvailableStatusEnum.like}'AND "postId" = ${post.id} AND "userId" = ${userId}`,
    );
    const dislikeCount = await this.dataSource.query(
      `SELECT * FROM "Posts-like" WHERE  "likesStatus" = '${AvailableStatusEnum.dislike}' AND "postId" = ${post.id} AND "userId" = ${userId}`,
    );

    const myStatus = await this.dataSource.query(
      `SELECT * FROM "Posts-like" WHERE "postId" = ${post.id} AND "userId" = ${userId}`,
    );
    const findThreeLastUser = await this.dataSource.query(
      `SELECT * FROM "Posts-like" WHERE "postId" = ${post.id} AND "likesStatus" = '${AvailableStatusEnum.like}' ORDER BY "createdAt" DESC LIMIT 3 `,
    );

    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: +likeCount[0], //+likeCount
        dislikesCount: +dislikeCount[0], //+dislikeCount
        myStatus: myStatus ? myStatus.likesStatus : 'None', //myStatus ? myStatus.likesStatus : 'None'
        newestLikes: findThreeLastUser.map((r) => ({
          addedAt: r.createdAt,
          userId: r.userId,
          login: r.login,
        })), //findThreeLastUser.map(UserDbType.UserInReqMapper)
      },
    };
  }
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
      newestLikes: [],
    },
  };
};
