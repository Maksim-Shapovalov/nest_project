import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './Users/User.controller';
import { UserRepository } from './Users/User.repository';
import { UserService } from './Users/User.service';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'process';
import { BlogsController } from './Blogs/Blogs.controller';
import { BlogsRepository } from './Blogs/Blogs.repository';
import { BlogsService } from './Blogs/Blogs.service';
import { CommentsController } from './Comment/Comment.controller';
import { CommentsRepository } from './Comment/Comments.repository';
import { CommentsService } from './Comment/Comments.service';

import { User, UserSchema } from './Users/Type/User.schemas';
import { PostsController } from './Posts/Posts.controller';
import { PostsRepository } from './Posts/Posts.repository';
import { PostsService } from './Posts/Posts.service';
import { Blog, BlogSchema } from './Blogs/Type/Blogs.schemas';
import {
  Comment,
  CommentsLike,
  CommentsLikeSchema,
  CommentsSchema,
} from './Comment/Type/Comments.schemas';
import {
  Post,
  PostLike,
  PostLikeSchema,
  PostsSchema,
} from './Posts/Type/Posts.schemas';

export const HTTP_STATUS = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,
  BAD_REQUEST_400: 400,
  UNAUTHORIZED_401: 401,
  Forbidden_403: 403,
  NOT_FOUND_404: 404,
  TOO_MANY_REQUESTS_429: 429,
};

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URL || 'mongodb://localhost:27017',
    ),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentsSchema },
      { name: Post.name, schema: PostsSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: CommentsLike.name, schema: CommentsLikeSchema },
    ]),
  ],
  controllers: [
    AppController,
    UserController,
    BlogsController,
    CommentsController,
    PostsController,
  ],
  providers: [
    AppService,
    UserRepository,
    UserService,
    BlogsRepository,
    BlogsService,
    CommentsRepository,
    CommentsService,
    PostsRepository,
    PostsService,
  ],
})
export class AppModule {}
