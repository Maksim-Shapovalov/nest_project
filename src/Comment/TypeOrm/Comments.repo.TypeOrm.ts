import { PaginationQueryType } from '../../qurey-repo/query-filter';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { AvailableStatusEnum, CommentsClass } from '../Type/Comment.type';
import { DataSource, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { NewestPostLike } from '../../Users/Type/User.type';
import { CommentEntity, CommentLikeEntity } from '../Type/Comment.entity';
import { UserEntity } from '../../Users/Type/User.entity';
import { PostsEntity } from '../../Posts/Type/Posts.entity';

@Injectable()
export class CommentSqlTypeOrmRepository {
  constructor(
    @InjectRepository(CommentEntity)
    protected commentEntityRepository: Repository<CommentEntity>,
    @InjectRepository(CommentLikeEntity)
    protected commentLikeEntityRepository: Repository<CommentLikeEntity>,
    @InjectRepository(UserEntity)
    protected userEntityRepo: Repository<UserEntity>,
    @InjectRepository(PostsEntity)
    protected postsEntityRepo: Repository<PostsEntity>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getCommentsInPost(
    postId: number,
    filter: PaginationQueryType,
    userId: NewestPostLike | null,
  ) {
    const findComments = await this.commentEntityRepository.findAndCount({
      where: {
        postId: {
          id: postId,
        },
      },
    });

    if (findComments[1] === 0) return null;
    const pageSizeInQuery: number = filter.pageSize;
    const totalCount = parseInt(findComments[1].toString());
    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageComment: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.commentEntityRepository.find({
      where: {
        postId: {
          id: postId,
        },
      },
      order: {
        [filter.sortBy]: filter.sortDirection,
      },
      take: pageSizeInQuery,
      skip: pageComment,
    });

    // await this.dataSource.query(
    //   `SELECT * FROM "comment_entity" WHERE "postId" = ${postId}
    //   ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT
    //   ${pageSizeInQuery} OFFSET ${pageComment}`,
    // );

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
    const user = await this.userEntityRepo.findOne({
      where: { id: comments.commentatorInfo.userId },
    });
    const post = await this.postsEntityRepo.findOne({
      where: { id: comments.postId },
    });
    const newComments = await this.commentEntityRepository.create({
      content: comments.content,
      user: user,
      userLogin: comments.commentatorInfo.userLogin,
      postId: post,
      createdAt: comments.createdAt,
    });
    const savePosts = await this.commentEntityRepository.save(newComments);
    return this.commentsMapper(savePosts[0], userId);
  }

  async getCommentById(commentId: number, userId: NewestPostLike | null) {
    const findComments = await this.commentEntityRepository.findAndCount({
      where: {
        id: commentId,
      },
    });
    if (!findComments[0]) {
      return null;
    }
    return this.commentsMapper(findComments[0], userId ? userId.userId : null);
  }

  async updateCommentsByCommentId(
    commentId: number,
    content: string,
  ): Promise<boolean> {
    const findComments = await this.commentEntityRepository.findAndCount({
      where: {
        id: commentId,
      },
    });
    if (findComments[0].length === 0) {
      return null;
    }
    await this.commentEntityRepository.update(commentId, { content: content });
    return true;
  }

  async updateStatusLikeUser(
    commentId: number,
    userId: number,
    status: AvailableStatusEnum,
  ) {
    const likeWithUserId = await this.commentLikeEntityRepository
      .createQueryBuilder('like')
      .where('like.likesStatus = :status', {
        status: AvailableStatusEnum.like,
      })
      .andWhere('like.commentId = :commentId', { commentId: commentId })
      .andWhere('like.userId = :userId', { userId: userId })
      .getCount();

    // await this.dataSource.query(
    //   `SELECT * FROM "comment_like_entity" WHERE "commentId" = ${commentId} AND "userId" = ${userId}`,
    // );
    const comment = await this.commentEntityRepository.find({
      where: { id: commentId },
    });
    //   await this.dataSource.query(
    //   `SELECT * FROM "comment_entity" WHERE id = ${commentId}`,
    // );

    if (!comment) {
      return false;
    }

    if (likeWithUserId[0]) {
      const updateStatus = await this.commentLikeEntityRepository.update(
        commentId && userId,
        { likesStatus: status },
      );

      // await this.dataSource.query(`UPDATE public."comment_like_entity"
      // SET "likesStatus"= '${status}'
      // WHERE "commentId" = ${commentId} AND "userId" = ${+userId}
      // RETURNING *`);
      if (!updateStatus) return null;

      return true;
    } else {
      const user = await this.userEntityRepo.findOne({
        where: { id: userId },
      });

      const newCommentLike = this.commentLikeEntityRepository.create({
        comment: comment[0],
        user: user,
        likesStatus: status,
      });
      await this.commentLikeEntityRepository.save(newCommentLike);
      return true;
    }
  }

  async deleteCommentsByCommentId(commentId: number): Promise<boolean> {
    await this.userEntityRepo.delete(commentId);
    return true;
  }
  async commentsMapper(comment: any, userId: number | null) {
    // let likeCount;
    // let dislikeCount;
    let myStatus;
    const likeCount = await this.commentLikeEntityRepository.count({
      where: {
        comment: { id: comment.id },
        likesStatus: AvailableStatusEnum.like,
      },
    });

    const dislikeCount = await this.commentLikeEntityRepository.count({
      where: {
        comment: { id: comment.id },
        likesStatus: AvailableStatusEnum.dislike,
      },
    });
    if (userId) {
      const myLike = await this.commentLikeEntityRepository.findOne({
        where: {
          user: { id: userId },
          comment: { id: comment.id },
        },
      });
      if (myLike) {
        myStatus = myLike.likesStatus;
      }
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
