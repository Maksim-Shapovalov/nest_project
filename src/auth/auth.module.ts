import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../Users/User.service';
import { RefreshTokenRepo } from '../Token/refreshToken-repo';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../Users/User.repository';
import { EmailManager } from '../Email/email-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../Users/Type/User.schemas';
import { Device, DeviceSchema } from '../Device/Type/DataId.schemas';
import { EmailAdapter } from '../Email/email-adapter';
import { DeletedTokenRepoRepository } from '../Token/deletedTokenRepo-repository';
import { SecurityDeviceService } from '../Device/SecurityDevice.service';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './strategies/basic.strategies';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtStrategy } from './strategies/bearer.strategies';
import { RefreshToken, TokenRefreshSchema } from '../Token/Token.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSQLRepository } from '../Users/postgres/User.SqlRepositories';

import { UserSQLTypeOrmRepository } from '../Users/TypeORM/User.repo.TypeORm';
import { SecurityDevicesSQLTypeOrmRepository } from '../Device/TypeOrm/Device.repo.TypeOrm';
import { DeviceEntity } from '../Device/Type/Device.entity';
import { UserEntity } from '../Users/Type/User.entity';
// const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
@Module({
  controllers: [AuthController],
  exports: [
    UserService,
    SecurityDeviceService,
    UserRepository,
    JwtService,
    BasicStrategy,
    JwtStrategy,
  ],
  imports: [
    //.forFeature([, DeviceEntity, UserEntity]),
    TypeOrmModule.forFeature([UserEntity, DeviceEntity]),
    PassportModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: TokenRefreshSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    UserService,
    SecurityDevicesSQLTypeOrmRepository,
    SecurityDeviceService,
    DeletedTokenRepoRepository,
    UserRepository,
    AuthService,
    RefreshTokenRepo,
    JwtService,
    EmailManager,
    EmailAdapter,
    BasicStrategy,
    JwtStrategy,
    UserSQLRepository,
    UserSQLTypeOrmRepository,
  ],
})
export class AuthModule {}
