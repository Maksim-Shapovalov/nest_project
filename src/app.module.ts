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
import { CommentsService } from './Comment/Comments.service';

import { User, UserSchema } from './Users/Type/User.schemas';
import { PostsController } from './Posts/Posts.controller';
import { PostsRepository } from './Posts/PostsRepository';
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
import { UserSQLRepository } from './Users/postgres/User.SqlRepositories';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsSQLController } from './Blogs/postgres/Blogs.postgress.controller';
import { PostsPostgresRepository } from './Posts/postgres/Posts.postgres.repository';
import { CommentSqlRepository } from './Comment/postgress/Comments.postgress.repository';
import { UserEntity } from './Users/Type/User.entity';
import { PostsEntity, PostsLikeEntity } from './Posts/Type/Posts.entity';
import { BlogsEntity } from './Blogs/Type/Blogs.entity';
import {
  CommentEntity,
  CommentLikeEntity,
} from './Comment/Type/Comment.entity';
import { DeviceEntity } from './Device/Type/Device.entity';
import { UserSQLTypeOrmRepository } from './Users/TypeORM/User.repo.TypeORm';
import { BlogsSQLTypeOrmRepository } from './Blogs/TypeOrm/Blogs.repo.TypeOrm';
import { PostsPostgresTypeOrmRepository } from './Posts/TypeOrm/Posts.repo.TypeOrm';
import { CommentSqlTypeOrmRepository } from './Comment/TypeOrm/Comments.repo.TypeOrm';
import { SecurityDevicesSQLTypeOrmRepository } from './Device/TypeOrm/Device.repo.TypeOrm';
import {
  AnswersEntity,
  QuizGameEntityNotPlayerInfo,
} from './quiz/entity/QuizGame.entity';
import { QuizGameTypeOrmRepo } from './quiz/quizeGame/QuizGame.TypeOrmRepo';
import { QuizGameService } from './quiz/quizeGame/QuizGame.service';
import { QuizGameController } from './quiz/quizeGame/QuizGame.controller';
import { QuizGameControllerSuperAdmin } from './quiz/SA.directory/quizGameSuperAdmin.Controller';
import { QuizGameSuperAdminService } from './quiz/SA.directory/quizGameSuperAdmin.Service';
import { QuestionsEntity } from './quiz/entity/Questions.Entity';
import { PlayersEntity } from './quiz/entity/Players.Entity';
import { QuizGameSuperAdminRepositoryTypeORM } from './quiz/SA.directory/quizGameSuperAdmin.Repository.TypeORM';
import { CustomUUIDValidation } from './Other/validator.validateUUID';
import { GetTopPlayersUseCase } from './quiz/quizeGame/useCase/GetTopPlayersUseCase';
import { GetHistoryGameByPlayerUseCase } from './quiz/quizeGame/useCase/GetHistoryGameByPlayerUseCase';
import { GetUnfinishedCurrentGameUseCase } from './quiz/quizeGame/useCase/GetUnfinishedCurrentGameUseCase';
import { FindActivePairUseCase } from './quiz/quizeGame/useCase/FindActivePairUseCase';
import { SendAnswerUseCase } from './quiz/quizeGame/useCase/SendAnswerUseCase';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { Gives10SecondToEndsGameCase } from './quiz/quizeGame/useCase/CronGive10SecondToEndsGame';

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
const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE2 } = process.env;
const repository = [
  CommentSqlTypeOrmRepository,
  CommentSqlRepository,
  BlogsRepository,
  PostsRepository,
  AllDataClearRepo,
  RefreshTokenRepo,
  UserSQLRepository,
  SecurityDevicesSQLTypeOrmRepository,
  QuizGameSuperAdminRepositoryTypeORM,
  QuizGameTypeOrmRepo,
  UserSQLTypeOrmRepository,
  PostsPostgresTypeOrmRepository,
  PostsPostgresRepository,
  BlogsSQLTypeOrmRepository,
];
const useCases = [
  GetTopPlayersUseCase,
  GetHistoryGameByPlayerUseCase,
  GetUnfinishedCurrentGameUseCase,
  FindActivePairUseCase,
  SendAnswerUseCase,
  Gives10SecondToEndsGameCase,
];
const service = [
  BlogsService,
  PostsService,
  AppService,
  QuizGameService,
  QuizGameSuperAdminService,
  CommentsService,
];

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: PGHOST,
      port: 5432,
      username: PGUSER,
      password: PGPASSWORD,
      database: PGDATABASE2,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      PostsEntity,
      BlogsEntity,
      CommentEntity,
      DeviceEntity,
      PostsLikeEntity,
      CommentLikeEntity,
      QuizGameEntityNotPlayerInfo,
      AnswersEntity,
      QuestionsEntity,
      PlayersEntity,
    ]),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    CqrsModule,
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
    PostsController,
    AppController,
    UserController,
    BlogsController,
    CommentsController,
    AllDataClearController,
    DeviceController,
    BlogsSQLController,
    QuizGameController,
    QuizGameControllerSuperAdmin,
  ],
  providers: [
    EmailManager,
    EmailAdapter,
    CustomBlogIdValidation,
    CustomUUIDValidation,
    ...service,
    ...repository,
    ...useCases,
  ],
})
export class AppModule {}
