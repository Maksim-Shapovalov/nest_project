import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { AuthService } from './aplication/service/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { EmailManager } from '../email/email-manager';
import { EmailAdapter } from '../email/email-adapter';
import { SecurityDeviceService } from '../device/aplication/SecurityDevice.service';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from '../../core/strategies/basic.strategies';
import { JwtStrategy } from '../../core/strategies/bearer.strategies';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSQLTypeOrmRepository } from '../users/infrastrucrue/User.repo.TypeORm';
import { SecurityDevicesSQLTypeOrmRepository } from '../device/infrastructure/Device.repo.TypeOrm';
import { DeviceEntity } from '../device/domain/Device.entity';
import { UserEntity } from '../users/domain/User.entity';
import { CustomUUIDValidation } from '../../core/decorators/validator.validateUUID';
import { CryptoModule } from '../../core/service/crypto/crypto.module';
import { LocalStrategies } from '../../core/strategies/local.strategies';
import { JwtTokenService } from '../../core/service/jwt/jwtTokenService';
import { CqrsModule } from '@nestjs/cqrs';
import { UserService } from '../users/aplication/User.service';
import { loginCase } from './aplication/useCase/login-useCase';
import { JwtConfig } from '../../core/config/JwtConfig';

@Module({
  controllers: [AuthController],
  exports: [SecurityDeviceService, JwtService, BasicStrategy, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([UserEntity, DeviceEntity]),
    PassportModule,
    CryptoModule,
    JwtModule.registerAsync({
      useFactory: (jwtConfig: JwtConfig) => {
        const jwtSecret: string = jwtConfig.jwtSecret;
        const jwtAccessExpirationTime: string =
          jwtConfig.jwtAccessExpirationTime;

        return {
          global: true,
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtAccessExpirationTime,
          },
        };
      },
      inject: [JwtConfig],
    }),
    CqrsModule,
  ],
  providers: [
    loginCase,
    UserService,
    SecurityDevicesSQLTypeOrmRepository,
    SecurityDeviceService,
    CustomUUIDValidation,
    AuthService,
    JwtService,
    EmailManager,
    EmailAdapter,
    BasicStrategy,
    JwtStrategy,
    UserSQLTypeOrmRepository,
    LocalStrategies,
    JwtTokenService,
  ],
})
export class AuthModule {}
