import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './Users/User.controller';
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
import { AllDataClearController } from './DataClear/all-data-clear.controller';
import { AllDataClearRepo } from './DataClear/AllDataClearRepo';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DeviceController } from './Device/SecurityDevice.controller';
import { Device, DeviceSchema } from './Device/Type/DataId.schemas';
import { AuthModule } from './auth/auth.module';
import { RefreshToken, TokenRefreshSchema } from './Token/Token.schema';
import { RefreshTokenRepo } from './Token/refreshToken-repo';
import { EmailManager } from './Email/email-manager';
import { EmailAdapter } from './Email/email-adapter';
import { CustomBlogIdValidation } from './Posts/validation/BlogExists.decorator';
import { ThrottlerModule } from '@nestjs/throttler';
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
    AuthModule,
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    MongooseModule.forRoot(
      process.env.MONGO_URL || 'mongodb://localhost:27017',
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentsSchema },
      { name: Post.name, schema: PostsSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: CommentsLike.name, schema: CommentsLikeSchema },
      { name: Device.name, schema: DeviceSchema },
      // { name: Token.name, schema: TokenSchema },
      { name: RefreshToken.name, schema: TokenRefreshSchema },
    ]),
  ],
  controllers: [
    AppController,
    UserController,
    BlogsController,
    CommentsController,
    PostsController,
    AllDataClearController,
    DeviceController,
  ],
  providers: [
    BlogsRepository,
    BlogsService,
    CommentsRepository,
    CommentsService,
    PostsRepository,
    PostsService,
    AllDataClearRepo,
    EmailManager,
    EmailAdapter,
    AppService,
    RefreshTokenRepo,
    CustomBlogIdValidation,
  ],
})
export class AppModule {}
