import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../Users/User.service';
import { DeviceClass } from '../Device/Type/Device.user';
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokenRepo } from '../Token/refreshToken-repo';
import { setting } from '../setting';
import { JwtService } from '@nestjs/jwt';
import jwt from 'jsonwebtoken';
import {
  FindUserByRecoveryCode,
  UserOutputModel,
  UserToPostsOutputModel,
} from '../Users/Type/User.type';
import { SecurityDevicesRepository } from '../Device/SecurityDevicesRepository';
import { randomUUID } from 'crypto';
import { newDataUser2, UserRepository } from '../Users/User.repository';
import { EmailManager } from '../Email/email-manager';
import bcrypt from 'bcrypt';
import { PayloadTypeRefresh } from '../Token/refreshToken-type';
import { SecurityDevicesSQLRepository } from '../Device/postgres/SecurityDeviceSQLRepository';
import { UserSQLRepository } from '../Users/User.SqlRepositories';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private refreshTokenRepo: RefreshTokenRepo,
    private jwtService: JwtService,
    protected deviceRepo: SecurityDevicesRepository,
    protected deviceSQLRepo: SecurityDevicesSQLRepository,
    protected userRepository: UserRepository,
    protected userSQLRepository: UserSQLRepository,
    protected emailManager: EmailManager,
  ) {}

  async signIn(
    body: { loginOrEmail: string; password: string },
    userAgent: { IP: string; deviceName: string },
  ): Promise<any> {
    const user: UserOutputModel = await this.usersService.checkCredentials(
      body.loginOrEmail,
      body.password,
    );
    if (user) {
      const userId = user.id;
      if (!userId) return null;
      const passwordHash = await this.usersService._generateHash(
        body.password,
        user.passwordSalt,
      );
      if (user.passwordHash !== passwordHash) {
        return null;
      }

      // const payload =
      const createRefreshTokenMeta = new DeviceClass(
        userAgent.IP || '123',
        userAgent.deviceName || 'internet',
        new Date().toISOString(),
        Math.floor(10000 + Math.random() * 90000).toString(),
        user.id,
      );
      // await this.deviceSQLRepo.addDeviceInDB(createRefreshTokenMeta);

      //
      const bodyToAccessToken = {
        userId: user.id.toString(),
      };
      const bodyToRefreshToken = {
        userId: user.id.toString(),
        deviceId: createRefreshTokenMeta.deviceId,
      };

      const accessToken: string = await this.jwtService.signAsync(
        bodyToAccessToken,
        { secret: setting.JWT_SECRET, expiresIn: '300s' },
      );
      const refreshToken: string = await this.jwtService.signAsync(
        bodyToRefreshToken,
        { secret: setting.JWT_REFRESH_SECRET, expiresIn: '400s' },
      );
      // await this.refreshTokenRepo.AddRefreshTokenInData(refreshToken);
      await this.refreshTokenRepo.AddRefreshTokenInData(refreshToken);
      await this.deviceSQLRepo.addDeviceInDB(
        createRefreshTokenMeta,
        refreshToken,
      );

      return { accessToken, refreshToken };
    }
    throw new UnauthorizedException();
  }
  async updateJWT(userId: number, oldRefreshToken: string) {
    // await this.refreshTokenRepo.DeleteRefreshTokenInData(oldRefreshToken);
    const parser = await this.jwtService.verify(oldRefreshToken, {
      secret: setting.JWT_REFRESH_SECRET,
    });
    if (!parser) {
      return null;
    }
    const createRefreshTokenMeta = {
      deviceId: parser.deviceId,
      userId: userId,
    };
    await this.deviceSQLRepo.updateDevice(createRefreshTokenMeta.deviceId);

    const accessToken: string = this.jwtService.sign(
      { userId: userId },
      {
        secret: setting.JWT_SECRET,
        expiresIn: '10s',
      },
    );
    const refreshToken: string = this.jwtService.sign(
      { userId: userId, deviceId: createRefreshTokenMeta.deviceId },
      { secret: setting.JWT_REFRESH_SECRET, expiresIn: '20s' },
    );
    await this.refreshTokenRepo.UpdateRefreshTokenInData(refreshToken);
    // await this.refreshTokenRepo.AddRefreshTokenInData(refreshToken);
    return { accessToken, refreshToken };
  }

  async sendEmailMessage(email: string) {
    const recoveryCode = randomUUID();
    const possibleUser = {
      email: email,
      recoveryCode: recoveryCode,
    };
    await this.userSQLRepository.findByEmailAndAddRecoveryCode(possibleUser);
    await this.emailManager.sendEmailWithTheCode(email, recoveryCode);
  }

  async findUserByRecoveryCode(newDataUser: newDataUser2) {
    newDataUser.newSalt = await bcrypt.genSalt(10);
    newDataUser.newPassword = await this.usersService._generateHash(
      newDataUser.newPassword,
      newDataUser.newSalt,
    );

    return this.userSQLRepository.findUserByRecoveryCode(newDataUser);
  }

  async confirmatoryUser(code: string) {
    const findUser = await this.userSQLRepository.findUsersByCode(code);
    console.log(findUser, 'findUser');
    if (!findUser) return null;
    if (findUser.emailConfirmation.isConfirmed)
      throw new BadRequestException({
        message: 'code is not exist',
        field: 'code',
      });
    return this.userSQLRepository.getUserByCode(code);
  }

  async doOperation(user: any) {
    await this.emailManager.sendEmailRecoveryMessage(user);
  }

  async findUserByEmail(user: FindUserByRecoveryCode) {
    const findConfirmCode = await this.userSQLRepository.findByLoginOrEmail(
      user.login,
    );
    console.log(findConfirmCode, 'findConfirmCode----------------------');
    if (findConfirmCode.emailConfirmation.isConfirmed)
      throw new BadRequestException({
        message: 'email is not exist',
        field: 'email',
      });
    const newConfirmationCode = {
      confirmationCode: uuidv4(),
    };
    const result = await this.userSQLRepository.updateCodeToResendingMessage(
      user.email,
      newConfirmationCode,
    );
    console.log(result, 'result----------------------');
    await this.emailManager.repeatSendEmailRecoveryMessage(
      result!.email,
      result!.login,
      result!.confirmationCode,
    );
  }
}
