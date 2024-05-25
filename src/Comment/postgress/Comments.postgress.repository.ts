import { injectable } from 'inversify';
import { PaginationQueryType } from '../../qurey-repo/query-filter';
import {
  AvailableStatusEnum,
  CommentsClass,
  CommentsTypeDb,
} from '../Type/Comment.type';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostsPostgresRepository } from '../../Posts/postgres/Posts.postgres.repository';

@injectable()
export class CommentsSQLRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected postsPostgresRepository: PostsPostgresRepository,
  ) {}
  async getCommentsInPost(
    postId: number,
    filter: PaginationQueryType,
    userId: number,
  ) {
    const findPost = await this.postsPostgresRepository.getPostsById(
      postId,
      userId,
    );

    if (!findPost[0]) {
      return null;
    }

    const pageSizeInQuery: number = filter.pageSize;
    const totalCountBlogs = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Comments" WHERE "postId" = ${postId}`,
    );
    const totalCount = parseInt(findPost[0].count);
    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageComment: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.dataSource.query(
      `SELECT * FROM "Comments" 
      ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT 
      ${pageSizeInQuery} OFFSET ${pageComment}`,
    );

    const itemsPromises = result.map((c) => this.commentsMapper(c, userId));
    const items = await Promise.all(itemsPromises);

    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCountBlogs,
      items: items,
    };
  }

  async saveComments(comments: CommentsClass, userId: number) {
    const randomId = Math.floor(Math.random() * 1000000);
    const newComments = await this.dataSource
      .query(`INSERT INTO public."Comments"(
     id, content, "userId", "userLogin", "postId", "createdAt")
     VALUES (${randomId}, '${comments.content}', '${comments.commentatorInfo.userId}', '${comments.commentatorInfo.userLogin}', '${comments.postId}', '${comments.createdAt}')
     RETURN *`);
    return this.commentsMapper(newComments, userId);
  }

  async getCommentById(commentId: number, userId: number | null) {
    const findComments = await this.dataSource.query(
      `SELECT * FROM "Comments" WHERE id = ${commentId}`,
    );
    if (!findComments) {
      return null;
    }
    return this.commentsMapper(findComments, userId);
  }

  async updateCommentsByCommentId(
    commentId: number,
    content: string,
  ): Promise<boolean> {
    const findComments = await this.dataSource.query(
      `SELECT * FROM "Comments" WHERE id = ${commentId}`,
    );
    if (findComments.length === 0) {
      return null;
    }

    await this.dataSource.query(`UPDATE public."Comments"
    SET "content"= '${content}',
      WHERE id = ${commentId};
      RETURNING *`);
    return true;
  }

  async updateStatusLikeUser(
    commentId: number,
    userId: number,
    status: AvailableStatusEnum,
  ) {
    const likeWithUserId = await this.dataSource.query(
      `SELECT * FROM "Comments-like" WHERE "commentId" = ${commentId} AND "userId" = ${userId}`,
    );
    const comment = await this.dataSource.query(
      `SELECT * FROM "Comments" WHERE id = ${commentId}`,
    );

    if (!comment) {
      return false;
    }

    if (likeWithUserId) {
      await this.dataSource.query(`UPDATE public."Comments-like"
      SET "likesStatus"= '${status}',
      WHERE "commentId" = ${commentId} AND "userId" = ${userId};
      RETURNING *`);

      return true;
    } else {
      const randomId = Math.floor(Math.random() * 1000000);

      await this.dataSource.query(`INSERT INTO public."Comments-like"(
      id, "commentId", "userId", "likesStatus")
      VALUES (${randomId}, ${commentId}, ${userId}, ${status});`);

      return true;
    }
  }

  async deleteCommentsByCommentId(commentId: number): Promise<boolean> {
    await this.dataSource.query(`DELETE FROM public."Comments"
     WHERE id = ${commentId};`);
    return true;
  }
  async commentsMapper(comment: CommentsTypeDb, userId: number | null) {
    const likeCount = await this.dataSource.query(
      `SELECT * FROM "Comments-like" WHERE "likesStatus" = '${AvailableStatusEnum.like}' AND "commentId" = ${comment.id}`,
    );

    const dislikeCount = await this.dataSource.query(
      `SELECT * FROM "Comments-like" WHERE "likesStatus" = '${AvailableStatusEnum.dislike}' AND "commentId" = ${comment.id}`,
    );

    const myStatus = await this.dataSource.query(
      `SELECT * FROM "Comments-like" WHERE "userId" = ${userId} AND "commentId" = ${comment.id}`,
    );

    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: +likeCount[0].likesStatus,
        dislikesCount: +dislikeCount[0].likesStatus,
        myStatus: myStatus[0].likesStatus ? myStatus[0].likesStatus : 'None',
      },
    };
  }
}
