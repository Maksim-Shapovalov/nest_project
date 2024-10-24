import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
import { PostsEntity, PostsLikeEntity } from '../Type/Posts.entity';
import { UserEntity } from '../../Users/Type/User.entity';
import { UserRepository } from '../../Users/User.repository';

@Injectable()
export class PostsPostgresTypeOrmRepository {
  constructor(
    @InjectRepository(PostsEntity)
    protected postsEntityRepo: Repository<PostsEntity>,
    @InjectRepository(UserEntity)
    protected userEntityRepo: Repository<UserEntity>,
    @InjectRepository(PostsLikeEntity)
    protected postsLikeEntityRepository: Repository<PostsLikeEntity>,
    protected userTypeOrmRepo: UserRepository,
  ) {}
  async getAllPosts(filter: PaginationQueryType, userId: string | null) {
    const pageSizeInQuery: number = filter.pageSize;
    const totalCountPosts = await this.postsEntityRepo.findAndCount();

    // dataSource.query(
    //   `SELECT COUNT(*) FROM "posts_entity"`,
    // );

    const totalCount = parseInt(totalCountPosts[1].toString());
    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.postsEntityRepo.find({
      order: {
        [filter.sortBy]: filter.sortDirection,
      },
      take: pageSizeInQuery,
      skip: pageBlog,
    });
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

  async getPostsById(id: string, user: NewestPostLike | null) {
    const findPosts = await this.postsEntityRepo.find({ where: { id: id } });
    if (findPosts.length === 0) {
      return null;
    }
    return this.postsLikeMapper(findPosts[0], user ? user.userId : null);
  }

  async getPostInBlogs(
    blogId: string,
    filter: PaginationQueryType,
    userId: NewestPostLike | null,
  ) {
    const totalCountPosts = await this.postsEntityRepo.findAndCount({
      where: { blogId: blogId },
    });

    const pageSizeInQuery: number = filter.pageSize;
    const totalCount = parseInt(totalCountPosts[1].toString());

    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.postsEntityRepo.find({
      order: {
        [filter.sortBy]: filter.sortDirection,
      },
      take: pageSizeInQuery,
      skip: pageBlog,
    });
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
    postId: string,
    user: NewestPostLike | null,
    status: AvailableStatusEnum,
  ) {
    const likeWithUserId: PostsLikeEntity[] =
      await this.postsLikeEntityRepository.find({
        where: { post: postId, user: user.userId },
      });
    // await this.dataSource.query(
    //   `SELECT * FROM "posts_like_entity" WHERE "postId" = ${postId} AND "userId" = ${user ? user.userId : null}`,
    // );
    const findUser = await this.userTypeOrmRepo.getUserById(user.userId);
    if (!findUser) {
      return false;
    }
    const comment = await this.getPostsById(postId, user);
    if (!comment) {
      return false;
    }
    if (likeWithUserId[0]) {
      const updateStatus = await this.postsLikeEntityRepository.update(
        likeWithUserId[0].id,
        {
          likesStatus: status,
        },
      );

      if (!updateStatus) return null;

      return updateStatus[0];
    } else {
      // const randomId = Math.floor(Math.random() * 1000000);
      const newPost = await this.postsLikeEntityRepository.create({
        post: postId,
        user: user.userId,
        login: findUser.login,
        createdAt: new Date().toISOString(),
        likesStatus: status,
      });
      await this.postsLikeEntityRepository.save(newPost);
      return true;
    }
  }

  async savePost(post: PostClass, userId: string) {
    const result = await this.postsEntityRepo.create({
      content: post.content,
      createdAt: post.createdAt,
      title: post.title,
      shortDescription: post.shortDescription,
      blogId: post.blogId,
      blogName: post.blogName,
    });
    const savePosts = await this.postsEntityRepo.save(result);
    return this.postsLikeMapper(savePosts, userId);
  }

  async updatePostsById(postBody: BodyUpdatingPost): Promise<boolean> {
    const findPostQuery = await this.postsEntityRepo.find({
      where: { id: postBody.postId, blogId: postBody.blogId },
    });
    if (findPostQuery.length === 0) {
      return null;
    }
    await this.postsEntityRepo.update(postBody.postId, {
      title: postBody.title,
      shortDescription: postBody.shortDescription,
      content: postBody.content,
      blogId: postBody.blogId,
    });
    return true;
  }

  async deletePostsById(id: string): Promise<boolean> {
    const findPostInDB = await this.postsEntityRepo.find({ where: { id: id } });
    if (!findPostInDB[0]) return false;
    const findPost = await this.postsEntityRepo.delete(id);
    if (findPost.affected > 0) return true;
    return false;
  }

  async postsLikeMapper(post: any, userId: string | null) {
    let likesCount;
    let dislikesCount;
    let myStatus;
    if (userId) {
      likesCount = await this.postsLikeEntityRepository
        .createQueryBuilder('like')
        .where('like.likesStatus = :status', {
          status: AvailableStatusEnum.like,
        })
        .andWhere('like.postId = :postId', { postId: post.id })
        .getCount();
      //"userId" = ${userId ? userId : null}
      dislikesCount = await this.postsLikeEntityRepository
        .createQueryBuilder('dislike')
        .where('like.likesStatus = :status', {
          status: AvailableStatusEnum.dislike,
        })
        .andWhere('like.postId = :postId', { postId: post.id })
        .getCount();

      myStatus = await this.postsLikeEntityRepository
        .createQueryBuilder('like')
        .where('like.postId = :postId', { postId: post.id })
        .andWhere('like.userId = :userId', { userId })
        .getOne();
    }

    const findThreeLastUser = await this.postsLikeEntityRepository
      .createQueryBuilder('like')
      .where('like.postId = :postId', { postId: post.id })
      .andWhere('like.likesStatus = :status', {
        status: AvailableStatusEnum.like,
      })
      .orderBy('like.createdAt', 'DESC')
      .take(3)
      .getMany();

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
          userId: r.user.toString(),
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
