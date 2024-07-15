import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginationQueryType } from '../../qurey-repo/query-filter';
import {
  BodyUpdatingPost,
  PostClass,
  PostsOutputSQLType,
} from '../Type/Posts.type';
import { AvailableStatusEnum } from '../../Comment/Type/Comment.type';
import { UserSQLRepository } from '../../Users/postgres/User.SqlRepositories';
import { Injectable } from '@nestjs/common';
import { NewestPostLike } from '../../Users/Type/User.type';
import { UserSQLTypeOrmRepository } from '../../Users/TypeORM/User.repo.TypeORm';

@Injectable()
export class PostsPostgresTypeOrmRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected userSQLRepository: UserSQLTypeOrmRepository,
  ) {}
  async getAllPosts(filter: PaginationQueryType, userId: number | null) {
    const pageSizeInQuery: number = filter.pageSize;
    const totalCountPosts = await this.dataSource.query(
      `SELECT COUNT(*) FROM "posts_entity"`,
    );

    const totalCount = parseInt(totalCountPosts[0].count);
    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.dataSource.query(
      `SELECT * FROM "posts_entity" 
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

  async getPostsById(id: number, user: NewestPostLike | null) {
    const findPosts = await this.dataSource.query(
      `SELECT * FROM "posts_entity" WHERE id = ${id}`,
    );

    if (findPosts.length === 0) {
      return null;
    }
    return this.postsLikeMapper(findPosts[0], user ? user.userId : null);
  }

  async getPostInBlogs(
    blogId: number,
    filter: PaginationQueryType,
    userId: NewestPostLike | null,
  ) {
    const totalCountPosts = await this.dataSource.query(
      `SELECT COUNT(*) FROM "posts_entity" WHERE "blogId" = ${blogId}`,
    );

    const pageSizeInQuery: number = filter.pageSize;
    const totalCount = parseInt(totalCountPosts[0].count);

    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.dataSource.query(
      `SELECT * FROM "posts_entity" WHERE "blogId" = ${blogId} 
      ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT 
      ${pageSizeInQuery} OFFSET ${pageBlog}`,
    );
    // const items = res.map((p) => postsLikeMapper(p,null))
    const itemsPromises = result.map((p) => {
      return this.postsLikeMapper(p, userId ? userId.userId : null);
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
    user: NewestPostLike | null,
    status: AvailableStatusEnum,
  ) {
    const likeWithUserId = await this.dataSource.query(
      `SELECT * FROM "posts_like_entity" WHERE "postId" = ${postId} AND "userId" = ${user ? user.userId : null}`,
    );
    const findUser = await this.userSQLRepository.getUserById(user.userId);
    if (!findUser) {
      return false;
    }
    const comment = await this.getPostsById(postId, user);
    if (!comment) {
      return false;
    }
    if (likeWithUserId[0]) {
      const updateStatus = await this.dataSource.query(
        `UPDATE public."posts_like_entity" SET "likesStatus"= '${status}'
	      WHERE "postId" = ${postId} AND "userId" = ${user ? user.userId : null}
	      RETURNING *`,
      );
      if (!updateStatus) return null;

      return updateStatus[0];
    } else {
      const randomId = Math.floor(Math.random() * 1000000);
      await this.dataSource.query(`INSERT INTO public."posts_like_entity"(
        id, "postId", "userId", login, "createdAt", "likesStatus")
        VALUES (${randomId},${postId}, ${user.userId}, '${findUser.login}', '${new Date().toISOString()}', '${status}');`);
      return true;
    }
  }

  async savePost(post: PostClass, userId: number) {
    const randomId = Math.floor(Math.random() * 1000000);
    // await this.postsLikeMapper(post, null);
    const newPost = `INSERT INTO public."posts_entity"(
      id, content, "createdAt", title, "shortDescription", "blogId", "blogName")
    VALUES (${randomId}, '${post.content}', '${post.createdAt}', '${post.title}', '${post.shortDescription}', '${post.blogId}', '${post.blogName}')
    RETURNING *`;
    const result = await this.dataSource.query(newPost);
    return this.postsLikeMapper(result[0], userId);
  }

  async updatePostsById(postBody: BodyUpdatingPost): Promise<boolean> {
    const findPostQuery = await this.dataSource.query(
      `SELECT * FROM "posts_entity" WHERE "id" = ${postBody.postId} AND "blogId" = ${postBody.blogId}`,
    );
    if (findPostQuery.length === 0) {
      return null;
    }

    await this.dataSource.query(`
    UPDATE "posts_entity"
    SET "title" = '${postBody.title}', "shortDescription" = '${postBody.shortDescription}', "content" = '${postBody.content}', "blogId" = ${postBody.blogId}
    WHERE "id" = '${postBody.postId}'
    RETURNING * `);
    return true;
  }

  async deletePostsById(id: number): Promise<boolean> {
    const findPostInDB = await this.dataSource.query(
      `SELECT * FROM "posts_entity" WHERE id = ${id}`,
    );
    if (!findPostInDB[0]) return false;
    const findPost = await this.dataSource.query(
      `DELETE FROM public."posts_entity" WHERE "id" = ${id} ;`,
    );
    if (findPost[1] > 0) return true;
  }

  async postsLikeMapper(post: any, userId: number | null) {
    let likesCount;
    let dislikesCount;
    let myStatus;
    if (userId) {
      likesCount = await this.dataSource.query(
        `SELECT COALESCE(COUNT(*), 0)::int as likesCount FROM "posts_like_entity" WHERE "likesStatus" = '${AvailableStatusEnum.like}'AND "postId" = ${post.id}`,
      );
      //"userId" = ${userId ? userId : null}
      dislikesCount = await this.dataSource.query(
        `SELECT COALESCE(COUNT(*), 0)::int as dislikesCount FROM "posts_like_entity" WHERE  "likesStatus" = '${AvailableStatusEnum.dislike}' AND "postId" = ${post.id}`,
      );

      myStatus = await this.dataSource.query(
        `SELECT * FROM "posts_like_entity" WHERE "postId" = ${post.id} AND "userId" = ${userId}`,
      );
    }

    const findThreeLastUser = await this.dataSource.query(
      `SELECT * FROM "posts_like_entity" WHERE "postId" = ${post.id} AND "likesStatus" = '${AvailableStatusEnum.like}' ORDER BY "createdAt" DESC LIMIT 3 `,
    );

    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: likesCount?.[0]?.likescount ?? 0, //+likeCount
        //likesCount?.[0]?.likesCount ?? 0, //+likeCount
        dislikesCount: dislikesCount?.[0]?.dislikescount ?? 0, //+dislikeCount
        // dislikesCount: dislikesCount?.[0]?.dislikesCount ?? 0, //+dislikeCount
        myStatus: myStatus?.[0]?.likesStatus ?? 'None', //myStatus ? myStatus.likesStatus : 'None'
        newestLikes: findThreeLastUser.map((r) => ({
          addedAt: r.createdAt,
          userId: r.userId.toString(),
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
