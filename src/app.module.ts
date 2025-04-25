import { Module } from '@nestjs/common';
import { UserController } from './features/users/api/User.controller';

import * as process from 'process';

import { BlogsController } from './features/blogs/api/Blogs.controller';
import { BlogsService } from './features/blogs/aplication/Blogs.service';
import { CommentsController } from './features/comment/api/Comment.controller';
import { CommentsService } from './features/comment/aplication/Comments.service';
import { PostsController } from './features/post/api/Posts.controller';
import { PostsService } from './features/post/aplication/Posts.service';
import { AllDataClearController } from './features/dataClear/all-data-clear.controller';
import { AllDataClearRepo } from './features/dataClear/AllDataClearRepo';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DeviceController } from './features/device/api/SecurityDevice.controller';
import { AuthModule } from './features/auth/auth.module';
import { EmailManager } from './features/email/email-manager';
import { EmailAdapter } from './features/email/email-adapter';
import { CustomBlogIdValidation } from './core/decorators/BlogExists.decorator';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsSQLController } from './features/blogs/api/Blogs.SA.postgress.controller';
import { UserEntity } from './features/users/domain/User.entity';
import {
  PostsEntity,
  PostsLikeEntity,
} from './features/post/domain/Posts.entity';
import { BlogsEntity } from './features/blogs/domain/Blogs.entity';
import {
  CommentEntity,
  CommentLikeEntity,
} from './features/comment/domain/Comment.entity';
import { DeviceEntity } from './features/device/domain/Device.entity';
import { UserSQLTypeOrmRepository } from './features/users/infrastrucrue/User.repo.TypeORm';
import { BlogsSQLTypeOrmRepository } from './features/blogs/infrastructure/Blogs.repo.TypeOrm';
import { PostsPostgresTypeOrmRepository } from './features/post/infrastrucrue/Posts.repo.TypeOrm';
import { CommentSqlTypeOrmRepository } from './features/comment/infrastructure/Comments.repo.TypeOrm';
import { SecurityDevicesSQLTypeOrmRepository } from './features/device/infrastructure/Device.repo.TypeOrm';

import { QuizGameTypeOrmRepo } from './features/quizGame/infrastrucrue/QuizGame.TypeOrmRepo';
import { QuizGameService } from './features/quizGame/aplication/QuizGame.service';
import { QuizGameController } from './features/quizGame/api/QuizGame.controller';
import { QuizGameControllerSuperAdmin } from './features/quizGame/api/quizGameSuperAdmin.Controller';
import { QuizGameSuperAdminService } from './features/quizGame/aplication/quizGameSuperAdmin.Service';

import { QuizGameSuperAdminRepositoryTypeORM } from './features/quizGame/infrastrucrue/quizGameSuperAdmin.Repository.TypeORM';
import { CustomUUIDValidation } from './core/decorators/validator.validateUUID';
import { GetTopPlayersUseCase } from './features/quizGame/aplication/useCase/quizGame/GetTopPlayersUseCase';
import { GetHistoryGameByPlayerUseCase } from './features/quizGame/aplication/useCase/quizGame/GetHistoryGameByPlayerUseCase';
import { GetUnfinishedCurrentGameUseCase } from './features/quizGame/aplication/useCase/quizGame/GetUnfinishedCurrentGameUseCase';
import { FindActivePairUseCase } from './features/quizGame/aplication/useCase/quizGame/FindActivePairUseCase';
import { SendAnswerUseCase } from './features/quizGame/aplication/useCase/quizGame/SendAnswerUseCase';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { Gives10SecondToEndsGameCase } from './features/quizGame/aplication/useCase/quizGame/CronGive10SecondToEndsGame';
import { BloggersController } from './features/blogs/api/BloggersController';
import { UpdatePostsByIdInBlogCase } from './features/blogs/api/useCaseByBlogger/UpdateBlogById';
import { DeleteBlogByIdCase } from './features/blogs/api/useCaseByBlogger/DeleteBlogsById';
import { DeletePostInBlogByIdCase } from './features/blogs/api/useCaseByBlogger/DeletePostInBlogById';
import { CreateNewBlogsCase } from './features/blogs/api/useCaseByBlogger/СreateNewBlogs';
import {
  AnswersEntity,
  QuizGameEntityNotPlayerInfo,
} from './features/quizGame/domain/QuizGame.entity';
import { QuestionsEntity } from './features/quizGame/domain/Questions.Entity';
import { PlayersEntity } from './features/quizGame/domain/Players.Entity';
import { EmailConfirmationEntity } from './features/users/domain/Email.confirmation.entity';
import { UserService } from './features/users/aplication/User.service';
import { CryptoService } from './core/service/crypto/crypro.service';
import { BanUserAndDeleteDeviceCase } from './features/users/aplication/UseCase/BanOrUnbanUserAndDeleteDevices';
import { CreateUserCase } from './features/users/aplication/UseCase/CreateUser.use-case';
import { DeleteUserCase } from './features/users/aplication/UseCase/DeleteUser.use-case';
import { GetUserByIdCase } from './features/users/aplication/UseCase/GetUserById.use-case';
import { ConfigModule } from './core/config/config.module';

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
const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE_LIVE_CODING } = process.env;
const repository = [
  CommentSqlTypeOrmRepository,
  AllDataClearRepo,
  SecurityDevicesSQLTypeOrmRepository,
  QuizGameSuperAdminRepositoryTypeORM,
  QuizGameTypeOrmRepo,
  UserSQLTypeOrmRepository,
  PostsPostgresTypeOrmRepository,
  BlogsSQLTypeOrmRepository,
];
const entity = [
  EmailConfirmationEntity,
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
];
const controllers = [
  BloggersController,
  PostsController,
  UserController,
  BlogsController,
  CommentsController,
  AllDataClearController,
  DeviceController,
  BlogsSQLController,
  QuizGameController,
  QuizGameControllerSuperAdmin,
];
const useCases = [
  DeleteUserCase,
  GetUserByIdCase,
  BanUserAndDeleteDeviceCase,
  CreateUserCase,
  GetTopPlayersUseCase,
  GetHistoryGameByPlayerUseCase,
  GetUnfinishedCurrentGameUseCase,
  FindActivePairUseCase,
  SendAnswerUseCase,
  Gives10SecondToEndsGameCase,
  UpdatePostsByIdInBlogCase,
  DeletePostInBlogByIdCase,
  CreateNewBlogsCase,
  DeleteBlogByIdCase,
];
const service = [
  CryptoService,
  UserService,
  BlogsService,
  PostsService,
  QuizGameService,
  QuizGameSuperAdminService,
  CommentsService,
];

@Module({
  imports: [
    // ConfigModule.forRoot(),
    ConfigModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: PGHOST,
      port: 5432,
      username: PGUSER,
      password: PGPASSWORD,
      database: PGDATABASE_LIVE_CODING,
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
    }),
    TypeOrmModule.forFeature([...entity]),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    CqrsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
  ],
  controllers: [...controllers],
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
