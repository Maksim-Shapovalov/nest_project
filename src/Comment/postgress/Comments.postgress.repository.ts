import { PaginationQueryType } from '../../qurey-repo/query-filter';
import { InjectDataSource } from '@nestjs/typeorm';

import {
  AvailableStatusEnum,
  CommentsClass,
  CommentsTypeDb,
} from '../Type/Comment.type';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentSqlRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getCommentsInPost(
    postId: number,
    filter: PaginationQueryType,
    userId: number,
  ) {
    const findComments = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Comments" WHERE "postId" = ${postId}`,
    );
    const pageSizeInQuery: number = filter.pageSize;
    const totalCountBlogs = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Comments" WHERE "postId" = ${postId}`,
    );
    const totalCount = parseInt(findComments[0].count);
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
    console.log(6, comments);
    const randomId = Math.floor(Math.random() * 1000000);
    console.log(7, randomId);
    const newComments = await this.dataSource
      .query(`INSERT INTO public."Comments"(
     id, content, "userId", "userLogin", "postId", "createdAt")
     VALUES (${randomId}, '${comments.content}', '${comments.commentatorInfo.userId}', '${comments.commentatorInfo.userLogin}', '${comments.postId}', '${comments.createdAt}')
     RETURNING *`);
    console.log(newComments, userId);
    const comment = {
      id: newComments[0].id,
      content: newComments[0].content,
      commentatorInfo: {
        userId: newComments[0].userId,
        userLogin: newComments[0].userLogin,
      },
      postId: newComments[0].postId,
      createdAt: newComments[0].createdAt,
    };
    console.log(comment);
    return this.commentsMapper(comment, userId);
  }

  async getCommentById(commentId: number, userId: number | null) {
    const findComments = await this.dataSource.query(
      `SELECT * FROM "Comments" WHERE id = ${commentId}`,
    );
    if (!findComments) {
      return null;
    }
    return this.commentsMapper(findComments[0], userId);
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
      `SELECT COUNT(*) AS likesCount 
        FROM "Comments-like" 
        WHERE "likesStatus" = '${AvailableStatusEnum.like}' 
        AND "commentId" = ${comment.id}`,
    );

    const dislikeCount = await this.dataSource.query(
      `SELECT COUNT(*) AS likesCount 
        FROM "Comments-like" 
        WHERE "likesStatus" = '${AvailableStatusEnum.dislike}' 
        AND "commentId" = ${comment.id}`,
    );

    const myStatus = await this.dataSource.query(
      `SELECT * FROM "Comments-like" WHERE "userId" = ${userId} AND "commentId" = ${comment.id}`,
    );
    let myStatusValue = 'None';
    if (myStatus.length > 0) {
      myStatusValue = myStatus[0].likesStatus;
    }

    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: +likeCount[0].likesStatus ? +likeCount[0].likesStatus : 0,
        dislikesCount: +dislikeCount[0].likesStatus
          ? +dislikeCount[0].likesStatus
          : 0,
        myStatus: myStatusValue,
      },
    };
  }
}
