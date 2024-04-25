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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private refreshTokenRepo: RefreshTokenRepo,
    private jwtService: JwtService,
    protected deleteDevice: SecurityDevicesRepository,
    protected userRepository: UserRepository,
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
        uuidv4(),
        user.id,
      );

      //
      const bodyToAccessToken = {
        userId: user.id,
      };
      const bodyToRefreshToken = {
        userId: user.id,
        deviceId: createRefreshTokenMeta.deviceId,
      };

      const accessToken: string = await this.jwtService.signAsync(
        bodyToAccessToken,
        { secret: setting.JWT_SECRET, expiresIn: '10s' },
      );
      const refreshToken: string = await this.jwtService.signAsync(
        bodyToRefreshToken,
        { secret: setting.JWT_REFRESH_SECRET, expiresIn: '20s' },
      );
      await this.refreshTokenRepo.AddRefreshTokenInData(refreshToken);

      return { accessToken, refreshToken };
    }
    throw new UnauthorizedException();
  }
  async updateJWT(userId: string, oldRefreshToken: string) {
    const parser = jwt.decode(oldRefreshToken) as PayloadTypeRefresh;
    if (!parser) {
      return null;
    }
    const createRefreshTokenMeta = {
      deviceId: parser.deviceId,
      userId: userId,
    };
    await this.deleteDevice.updateDevice(createRefreshTokenMeta.deviceId);

    const accessToken: string = jwt.sign(
      { userId: userId },
      setting.JWT_SECRET,
      { expiresIn: '10sec' },
    );
    const refreshToken: string = jwt.sign(
      { userId: userId, deviceId: createRefreshTokenMeta.deviceId },
      setting.JWT_REFRESH_SECRET,
      { expiresIn: '20sec' },
    );
    return { accessToken, refreshToken };
  }

  async sendEmailMessage(email: string) {
    const recoveryCode = randomUUID();
    const possibleUser = {
      email: email,
      recoveryCode: recoveryCode,
    };
    await this.userRepository.findByEmailAndAddRecoveryode(possibleUser);
    await this.emailManager.sendEmailWithTheCode(email, recoveryCode);
  }

  async findUserByRecoveryCode(newDataUser: newDataUser2) {
    newDataUser.newSalt = await bcrypt.genSalt(10);
    newDataUser.newPassword = await this.usersService._generateHash(
      newDataUser.newPassword,
      newDataUser.newSalt,
    );

    return this.userRepository.findUserByRecoveryCode(newDataUser);
  }

  async confirmatoryUser(code: string) {
    const findUser = await this.userRepository.findUsersByCode(code);
    if (!findUser) return null;
    if (findUser.emailConfirmation.isConfirmed)
      throw new BadRequestException({
        message: 'code is not exist',
        field: 'code',
      });
    return this.userRepository.getUserByCode(code);
  }

  async doOperation(user: any) {
    await this.emailManager.sendEmailRecoveryMessage(user);
  }

  async findUserByEmail(user: FindUserByRecoveryCode) {
    const findConfirmCode = await this.userRepository.findByLoginOrEmail(
      user.login,
    );
    if (findConfirmCode.emailConfirmation.isConfirmed)
      throw new BadRequestException({
        message: 'email is not exist',
        field: 'email',
      });
    const newConfirmationCode = {
      confirmationCode: uuidv4(),
    };
    const result = await this.userRepository.updateCodeToResendingMessage(
      user.email,
      newConfirmationCode,
    );
    await this.emailManager.repeatSendEmailRecoveryMessage(
      result!.email,
      result!.login,
      result!.emailConfirmation.confirmationCode,
    );
  }
}
