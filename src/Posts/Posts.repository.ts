import { PostClass } from './Type/Posts.type';
import { ObjectId } from 'mongodb';
import { PaginationQueryType } from '../qurey-repo/query-filter';
import { BlogsRepository } from '../Blogs/Blogs.repository';
import { injectable } from 'inversify';
import 'reflect-metadata';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Post,
  PostLike,
  PostLikeDocument,
  PostsDocument,
} from './Type/Posts.schemas';

import { NotFoundException } from '@nestjs/common';

import { UserRepository } from '../Users/User.repository';
import { AvailableStatusEnum } from '../Comment/Type/Comment.type';
import { UserDbType } from '../Users/Type/User.type';

@injectable()
export class PostsRepository {
  constructor(
    protected blogsRepository: BlogsRepository,
    @InjectModel(Post.name) protected postModel: Model<PostsDocument>,
    @InjectModel(PostLike.name)
    protected postLikeModel: Model<PostLikeDocument>,
    protected userRepository: UserRepository,
  ) {}
  async getAllPosts(filter: PaginationQueryType) {
    const pageSizeInQuery: number = filter.pageSize;
    const totalCountBlogs = await this.postModel.countDocuments({});

    const pageCountBlogs: number = Math.ceil(totalCountBlogs / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;
    const result = await this.postModel
      .find({})
      .sort({ [filter.sortBy]: filter.sortDirection })
      .skip(pageBlog)
      .limit(pageSizeInQuery)
      .lean();
    // const items = result.map((p) => postsLikeMapper(p,userId))
    const itemsPromises = result.map((p) => this.postsLikeMapper(p, null));
    const items = await Promise.all(itemsPromises);
    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCountBlogs,
      items: items,
    };
  }

  async getPostsById(id: string, userId: string | null) {
    const findPosts = await this.postModel.findOne({ _id: new ObjectId(id) });

    if (!findPosts) {
      return null;
    }
    return this.postsLikeMapper(findPosts, userId);
  }

  async getPostInBlogs(blogId: string, filter: PaginationQueryType) {
    const findBlog = await this.blogsRepository.getBlogsById(blogId);
    if (!findBlog) {
      return null;
    }

    const filterQuery = { blogId: findBlog.id };

    const pageSizeInQuery: number = filter.pageSize;
    const totalCountBlogs = await this.postModel.countDocuments(filterQuery);

    const pageCountBlogs: number = Math.ceil(totalCountBlogs / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const res = await this.postModel
      .find(filterQuery)
      .sort({ [filter.sortBy]: filter.sortDirection })
      .skip(pageBlog)
      .limit(pageSizeInQuery)
      .lean();
    // const items = res.map((p) => postsLikeMapper(p,null))
    const itemsPromises = res.map((p) => {
      return this.postsLikeMapper(p, null);
    });
    const items = await Promise.all(itemsPromises);

    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCountBlogs,
      items: items,
    };
  }
  async updateStatusLikeUser(
    postId: string,
    userId: string,
    status: AvailableStatusEnum,
  ) {
    const likeWithUserId = await this.postLikeModel
      .findOne({
        userId: userId,
        postId: postId,
      })
      .exec();
    const findUser = await this.userRepository.getUserById(
      new ObjectId(userId),
    );
    const comment = await this.postModel
      .findOne({
        _id: new ObjectId(postId),
      })
      .exec();

    if (!comment) {
      return false;
    }

    if (likeWithUserId) {
      const updateStatus = await this.postLikeModel.updateOne(
        { postId: postId, userId: userId },
        {
          $set: {
            likesStatus: status,
          },
        },
      );
      if (!updateStatus) throw new NotFoundException();

      return updateStatus.matchedCount === 1;
    }

    await this.postLikeModel.create({
      postId,
      userId: userId,
      likesStatus: status,
      createdAt: new Date().toISOString(),
      login: findUser.login,
    });

    return true;
  }

  async savePost(post: PostClass) {
    // await this.postsLikeMapper(post, null);
    const newPost = await this.postModel.create(post);
    return this.postsLikeMapper(newPost, null);
  }

  async updatePostsById(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<boolean> {
    const res = await this.postModel.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          shortDescription,
          content,
          blogId,
        },
      },
    );
    return res.matchedCount === 1;
  }

  async deletePostsById(id: string): Promise<boolean> {
    const findPost = await this.postModel.deleteOne({ _id: new ObjectId(id) });
    return findPost.deletedCount === 1;
  }
  async postsLikeMapper(post: any, userId: string | null) {
    const likeCount = await this.postLikeModel.countDocuments({
      likesStatus: AvailableStatusEnum.like,
      postId: post._id.toString(),
    });
    const dislikeCount = await this.postLikeModel.countDocuments({
      likesStatus: AvailableStatusEnum.dislike,
      postId: post._id.toString(),
    });

    const myStatus = await this.postLikeModel
      .findOne({
        userId: userId,
        postId: post._id.toString(),
      })
      .exec();
    const findThreeLastUser = await this.postLikeModel
      .find({
        likesStatus: { $all: ['Like'] },
        postId: post._id.toString(),
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();

    return {
      id: post._id.toHexString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: +likeCount, //+likeCount
        dislikesCount: +dislikeCount, //+dislikeCount
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
