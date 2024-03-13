import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../Users/User.service';
import { RefreshTokenRepo } from '../Token/refreshToken-repo';
import { JwtService } from '@nestjs/jwt';
import { SecurityDevicesRepository } from '../Device/SecurityDevicesRepository';
import { UserRepository } from '../Users/User.repository';
import { EmailManager } from '../Email/email-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../Users/Type/User.schemas';
import { Device, DeviceSchema } from '../Device/Type/DataId.schemas';
import { Token, TokenSchema } from '../Token/Token.schema';
import { EmailAdapter } from '../Email/email-adapter';
import { DeletedTokenRepoRepository } from '../Token/deletedTokenRepo-repository';
import { SecurityDeviceService } from '../Device/SecurityDevice.service';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './strategies/basic.strategies';

@Module({
  controllers: [AuthController],
  exports: [
    UserService,
    SecurityDevicesRepository,
    SecurityDeviceService,
    UserRepository,
    JwtService,
    BasicStrategy,
  ],
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    UserService,
    SecurityDevicesRepository,
    SecurityDeviceService,
    DeletedTokenRepoRepository,
    UserRepository,
    AuthService,
    RefreshTokenRepo,
    JwtService,
    EmailManager,
    EmailAdapter,
    BasicStrategy,
  ],
})
export class AuthModule {}
