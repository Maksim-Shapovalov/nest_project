import { PaginationQueryType } from '../../qurey-repo/query-filter';
import { InjectDataSource } from '@nestjs/typeorm';

import { AvailableStatusEnum, CommentsClass } from '../Type/Comment.type';
import { DataSource } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { NewestPostLike } from '../../Users/Type/User.type';

@Injectable()
export class CommentSqlTypeOrmRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getCommentsInPost(
    postId: number,
    filter: PaginationQueryType,
    userId: NewestPostLike | null,
  ) {
    const findComments = await this.dataSource.query(
      `SELECT COUNT(*) FROM "comment_entity" WHERE "postId" = ${postId}`,
    );
    console.log(findComments);
    if (findComments[0].count === '0') return null;
    const pageSizeInQuery: number = filter.pageSize;
    // const totalCountBlogs = await this.dataSource.query(
    //   `SELECT COUNT(*) FROM "Comments" WHERE "postId" = ${postId}`,
    // );
    const totalCount = parseInt(findComments[0].count);
    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageComment: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.dataSource.query(
      `SELECT * FROM "comment_entity" WHERE "postId" = ${postId}
      ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT 
      ${pageSizeInQuery} OFFSET ${pageComment}`,
    );

    const itemsPromises = result.map((c) =>
      this.commentsMapper(c, userId ? userId.userId : null),
    );
    const items = await Promise.all(itemsPromises);

    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCount,
      items: items,
    };
  }

  async saveComments(comments: CommentsClass, userId: number) {
    const randomId = Math.floor(Math.random() * 1000000);
    const newComments = await this.dataSource
      .query(`INSERT INTO public."comment_entity"(
     id, content, "userId", "userLogin", "postId", "createdAt")
     VALUES (${randomId}, '${comments.content}', '${comments.commentatorInfo.userId}', '${comments.commentatorInfo.userLogin}', '${comments.postId}', '${comments.createdAt}')
     RETURNING *`);
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
    return this.commentsMapper(comment, userId);
  }

  async getCommentById(commentId: number, userId: NewestPostLike | null) {
    const findComments = await this.dataSource.query(
      `SELECT * FROM "comment_entity" WHERE id = ${commentId}`,
    );
    if (!findComments[0]) {
      return null;
    }
    return this.commentsMapper(findComments[0], userId ? userId.userId : null);
  }

  async updateCommentsByCommentId(
    commentId: number,
    content: string,
  ): Promise<boolean> {
    const findComments = await this.dataSource.query(
      `SELECT * FROM "comment_entity" WHERE id = ${commentId}`,
    );
    if (findComments.length === 0) {
      return null;
    }

    await this.dataSource.query(`UPDATE public."comment_entity"
    SET "content"= '${content}'
      WHERE id = ${commentId}
      RETURNING *`);
    return true;
  }

  async updateStatusLikeUser(
    commentId: number,
    userId: number,
    status: AvailableStatusEnum,
  ) {
    const likeWithUserId = await this.dataSource.query(
      `SELECT * FROM "comment_like_entity" WHERE "commentId" = ${commentId} AND "userId" = ${userId}`,
    );
    const comment = await this.dataSource.query(
      `SELECT * FROM "comment_entity" WHERE id = ${commentId}`,
    );

    if (!comment) {
      return false;
    }

    if (likeWithUserId[0]) {
      const updateStatus = await this.dataSource
        .query(`UPDATE public."comment_like_entity"
      SET "likesStatus"= '${status}'
      WHERE "commentId" = ${commentId} AND "userId" = ${+userId}
      RETURNING *`);
      if (!updateStatus) return null;

      return true;
    } else {
      const randomId = Math.floor(Math.random() * 1000000);

      await this.dataSource.query(`INSERT INTO public."comment_like_entity"(
      id, "commentId", "userId", "likesStatus")
      VALUES (${randomId}, ${commentId}, ${+userId}, '${status}');`);

      return true;
    }
  }

  async deleteCommentsByCommentId(commentId: number): Promise<boolean> {
    await this.dataSource.query(`DELETE FROM public."comment_entity"
     WHERE id = ${commentId};`);
    return true;
  }
  async commentsMapper(comment: any, userId: number | null) {
    // let likeCount;
    // let dislikeCount;
    let myStatus;
    const likeCount = await this.dataSource.query(
      `SELECT COALESCE(COUNT(*), 0)::int as likesCount FROM "comment_like_entity" WHERE "likesStatus" = '${AvailableStatusEnum.like}'AND "commentId" = ${comment.id}`,
    );
    const dislikeCount = await this.dataSource.query(
      `SELECT COALESCE(COUNT(*), 0)::int as likesCount FROM "comment_like_entity" WHERE "likesStatus" = '${AvailableStatusEnum.dislike}'AND "commentId" = ${comment.id}`,
    );
    if (userId) {
      myStatus = await this.dataSource.query(
        `SELECT * FROM "comment_like_entity" WHERE "userId" = ${userId} AND "commentId" = ${comment.id}`,
      );
    }

    return {
      id: comment.id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo
          ? comment.commentatorInfo.userId.toString()
          : comment.userId.toString(),
        userLogin: comment.commentatorInfo
          ? comment.commentatorInfo.userLogin
          : comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: likeCount?.[0]?.likescount ?? 0,
        dislikesCount: dislikeCount?.[0]?.likescount ?? 0,
        myStatus: myStatus?.[0]?.likesStatus ?? 'None',
      },
    };
  }
}
