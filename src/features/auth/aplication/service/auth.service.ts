import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { setting } from '../../../../setting';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { EmailManager } from '../../../email/email-manager';
import bcrypt from 'bcrypt';
import { SecurityDevicesSQLTypeOrmRepository } from '../../../device/infrastructure/Device.repo.TypeOrm';
import {
  newDataUser2,
  UserSQLTypeOrmRepository,
} from '../../../users/infrastrucrue/User.repo.TypeORm';
import { CryptoService } from '../../../../core/service/crypto/crypro.service';
import { Notification } from '../../../../core/notification/notification';
import { User } from '../../../users/domain/User.type';
import { JwtConfig } from '../../../../core/config/JwtConfig';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    protected deviceSQLRepo: SecurityDevicesSQLTypeOrmRepository,
    protected userRepository: UserSQLTypeOrmRepository,
    protected emailManager: EmailManager,
    private jwtConfig: JwtConfig,
    private readonly cryptoService: CryptoService,
  ) {}

  async updateJWT(userId: string, oldRefreshToken: string) {
    // await this.refreshTokenRepo.DeleteRefreshTokenInData(oldRefreshToken);
    const parser = await this.jwtService.verify(oldRefreshToken, {
      secret: this.jwtConfig.jwtSecret,
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
        secret: this.jwtConfig.jwtSecret,
        expiresIn: this.jwtConfig.jwtAccessExpirationTime,
      },
    );
    const refreshToken: string = this.jwtService.sign(
      { userId: userId, deviceId: createRefreshTokenMeta.deviceId },
      {
        secret: this.jwtConfig.jwtSecret,
        expiresIn: this.jwtConfig.jwtRefreshExpirationTime,
      },
    );
    return { accessToken, refreshToken };
  }

  async sendEmailMessage(email: string) {
    const recoveryCode = randomUUID();
    const possibleUser = {
      email: email,
      recoveryCode: recoveryCode,
    };
    await this.userRepository.findByEmailAndAddRecoveryCode(possibleUser);
    await this.emailManager.sendEmailWithTheCode(email, recoveryCode);
  }

  async findUserByRecoveryCode(newDataUser: newDataUser2) {
    newDataUser.newSalt = await bcrypt.genSalt(10);
    newDataUser.newPassword = await this.cryptoService.createHash(
      newDataUser.newPassword,
      newDataUser.newSalt,
    );

    return this.userRepository.findUserByRecoveryCode(newDataUser);
  }

  async confirmatoryUser(code: string) {
    const findUser = await this.userRepository.findUsersByCode(code);
    if (!findUser) return null;
    if (findUser.getIsConfirmed())
      throw new BadRequestException({
        message: 'code is not exist',
        field: 'code',
      });
    return this.userRepository.getUserByCode(code);
  }

  async doOperation(user: any) {
    await this.emailManager.sendEmailRecoveryMessage(user);
  }

  async findUserByEmail(user: User) {
    const findConfirmCode = await this.userRepository.findByLoginOrEmail(
      user.getLogin(),
    );
    if (findConfirmCode.getIsConfirmed())
      throw new BadRequestException({
        message: 'email is not exist',
        field: 'email',
      });
    const newConfirmationCode = {
      confirmationCode: uuidv4(),
    };
    const result = await this.userRepository.updateCodeToResendingMessage(
      user.getEmail(),
      newConfirmationCode,
    );
    await this.emailManager.repeatSendEmailRecoveryMessage(
      result!.email,
      result!.login,
      result!.emailConfirmation.confirmationCode,
    );
  }
  async validateUser(loginOrEmail: string, password: string) {
    const user = await this.userRepository.findByLoginOrEmail(loginOrEmail);
    console.log(user);
    if (
      !user ||
      !user.getPassword() ||
      !(await this.cryptoService.compare(password, user.getPassword()))
    ) {
      return Notification.unauthorized('Wrong email or password');
    }

    return Notification.success(user.getId());
  }
  async validateUserByLogin(loginOrEmail: string) {
    const user = await this.userRepository.findByLoginOrEmail(loginOrEmail);
    return Notification.success(user.getId());
  }
}
