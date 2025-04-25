import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../service/auth.service';
import { SecurityDevicesSQLTypeOrmRepository } from '../../../device/infrastructure/Device.repo.TypeOrm';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayload,
  JwtTokenService,
  RefreshTokenPayload,
} from '../../../../core/service/jwt/jwtTokenService';
import { randomUUID } from 'node:crypto';
import { Notification } from '../../../../core/notification/notification';
import { Device } from '../../../device/domain/Device.type';
import { JwtConfig } from '../../../../core/config/JwtConfig';

export class loginCommand {
  constructor(
    public userId: string,
    public ip: string,
    public title: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(loginCommand)
export class loginCase implements ICommandHandler<loginCommand> {
  constructor(
    protected authService: AuthService,
    protected deviceRepository: SecurityDevicesSQLTypeOrmRepository,
    protected jwtService: JwtTokenService,
    protected jwtTokenService: JwtService,
  ) {}
  async execute(command: loginCommand): Promise<{} | null> {
    const JwtAccessTokenPayload: AccessTokenPayload = {
      userId: command.userId,
    };
    const deviceId: string = randomUUID();
    const JwtRefreshTokenPayload: RefreshTokenPayload = {
      userId: command.userId,
      deviceId,
    };
    console.log(2);
    const accessToken: string = await this.jwtService.generateAccessToken(
      JwtAccessTokenPayload,
    );
    console.log(22);
    const refreshToken: string = await this.jwtService.generateRefreshToken(
      JwtRefreshTokenPayload,
    );
    console.log(3);
    const decodedRefreshToken: RefreshTokenPayload =
      await this.jwtTokenService.decode<RefreshTokenPayload>(refreshToken);
    if (!decodedRefreshToken)
      return Notification.unauthorized('Invalid refresh token');
    console.log(4);
    const { iat, exp } = decodedRefreshToken;
    const device: Device = Device.create(
      command.userId,
      command.title,
      command.ip,
      iat,
      exp,
    );
    await this.deviceRepository.create(device);

    return Notification.success({
      accessToken,
      refreshToken,
    });

    // if (user) {
    //   const userId = user.id;
    //   if (!userId) return null;
    //   const passwordHash = await this.usersService._generateHash(
    //     body.password,
    //     user.passwordSalt,
    //   );
    //   if (user.passwordHash !== passwordHash) {
    //     return null;
    //   }
    //
    //   // const payload =
    //   const createRefreshTokenMeta = new DeviceClass(
    //     userAgent.IP || '123',
    //     userAgent.deviceName || 'internet',
    //     new Date().toISOString(),
    //     user.id,
    //   );
    //
    //   const addDeviceToDB = await this.deviceRepository.createDeviceAndSaveToDB(
    //     createRefreshTokenMeta,
    //     user.id,
    //   );
    //   const bodyToAccessToken = {
    //     userId: user.id.toString(),
    //   };
    //   const bodyToRefreshToken = {
    //     userId: user.id.toString(),
    //     deviceId: addDeviceToDB.deviceId,
    //   };
    //   const accessToken: string = await this.jwtService.signAsync(
    //     bodyToAccessToken,
    //     { secret: setting.JWT_SECRET, expiresIn: '1000s' },
    //   );
    //   const refreshToken: string = await this.jwtService.signAsync(
    //     bodyToRefreshToken,
    //     { secret: setting.JWT_REFRESH_SECRET, expiresIn: '2000s' },
    //   );
    //   // await this.refreshTokenRepo.AddRefreshTokenInData(refreshToken);
    //   await this.refreshTokenRepo.AddRefreshTokenInData(refreshToken);
    //   await this.deviceRepository.addDeviceInDB(addDeviceToDB, refreshToken);
    //   return { accessToken, refreshToken };
    // }
    // throw new UnauthorizedException();
  }
}
