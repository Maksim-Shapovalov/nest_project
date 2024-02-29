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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Token.name, schema: TokenSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    RefreshTokenRepo,
    JwtService,
    SecurityDevicesRepository,
    SecurityDeviceService,
    DeletedTokenRepoRepository,
    UserRepository,
    EmailManager,
    EmailAdapter,
  ],
})
export class AuthModule {}
