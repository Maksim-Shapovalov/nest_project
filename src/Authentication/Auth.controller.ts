import { injectable } from 'inversify';
import { AuthService } from './Auth.service';
import { UserService } from '../Users/User.service';
import { SecurityDeviceService } from '../Device/SecurityDevice.service';
import { userMapper, UserRepository } from '../Users/User.repository';
import { DeletedTokenRepoRepository } from '../Token/deletedTokenRepo-repository';
import { JwtService } from '../Token/jwt-service';
import { Request, Response } from 'express';
import 'reflect-metadata';
import { HTTP_STATUS } from '../Index';
import { Body, Controller, Post } from '@nestjs/common';

@injectable()
@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected serviceUser: UserService,
    protected securityDeviceService: SecurityDeviceService,
    protected userRepository: UserRepository,
    protected deletedTokenRepoRepository: DeletedTokenRepoRepository,
    protected jwtService: JwtService,
  ) {}
  @Post()
  async loginInApp(
    @Headers() headers: any,
    @Body() body: { loginOrEmail: string; password: string },
  ) {
    const userAgent = {
      IP: headers['x-forwarded-for'],
      deviceName: headers['user-agent'],
    };

    const user = await this.serviceUser.checkCredentials(
      body.loginOrEmail,
      body.password,
    );

    if (!user) return HTTP_STATUS.UNAUTHORIZED_401;

    const { accessToken, refreshToken } =
      await this.jwtService.createdJWTAndInsertDevice(
        userMapper(user),
        userAgent,
      );

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return res.status(HTTP_STATUS.OK_200).send({ accessToken });
  }

  async passwordRecovery(
    req: Request<{}, {}, { email: string }>,
    res: Response,
  ) {
    const requestEmail: string = req.body.email;
    if (!requestEmail) return res.sendStatus(HTTP_STATUS.BAD_REQUEST_400);
    await this.authService.sendEmailMessage(requestEmail);
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async createdNewPasswordForUserby(req: Request, res: Response) {
    const requestEmail = {
      newPassword: req.body.newPassword,
      recoveryCode: req.body.recoveryCode,
      newSalt: '',
    };
    if (!requestEmail) return res.sendStatus(HTTP_STATUS.BAD_REQUEST_400);
    const user = await this.authService.findUserByRecoveryCode(requestEmail);
    if (!user) return res.sendStatus(HTTP_STATUS.BAD_REQUEST_400);
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async refreshToken(req: Request, res: Response) {
    const oldRefreshToken = req.cookies.refreshToken;
    const user = req.body.user;

    const token = await this.jwtService.updateJWT(
      userMapper(user),
      oldRefreshToken,
    ); //update

    if (!token) return res.sendStatus(HTTP_STATUS.NOT_FOUND_404);

    const { accessToken, refreshToken } = token;

    await this.deletedTokenRepoRepository.deletedTokens(oldRefreshToken);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return res.status(HTTP_STATUS.OK_200).send({ accessToken });
  }

  async logoutInApp(req: Request, res: Response) {
    const user = req.body.user;
    const device = req.body.deviceId;
    const token = req.cookies.refreshToken;

    const deletedDevice =
      await this.securityDeviceService.deletingDevicesExceptId(
        user._id.toString(),
        device.deviceId,
      );
    const bannedToken =
      await this.deletedTokenRepoRepository.deletedTokens(token);

    if (!bannedToken) {
      return res.sendStatus(HTTP_STATUS.BAD_REQUEST_400);
    }
    if (!deletedDevice) {
      return res.sendStatus(HTTP_STATUS.BAD_REQUEST_400);
    }
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async registrationConfirmation(req: Request, res: Response) {
    const result = await this.authService.confirmatoryUser(req.body.code);
    if (!result) {
      res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
      return;
    }
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async registrationInApp(req: Request, res: Response) {
    const user = {
      login: req.body.login,
      password: req.body.password,
      email: req.body.email,
    };
    const newUser = await this.serviceUser.getNewUser(user);
    const findUser = await this.userRepository.findByLoginOrEmail(
      newUser.login,
    );
    await this.authService.doOperation(findUser);
    res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async registrationEmailResending(req: Request, res: Response) {
    const findUser = await this.userRepository.findByLoginOrEmail(
      req.body.email,
    );
    if (!findUser) return res.sendStatus(HTTP_STATUS.BAD_REQUEST_400);
    await this.authService.findUserByEmail(findUser);
    return res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
  }

  async me(req: Request, res: Response) {
    const user = req.body.user;

    if (!user) return res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);

    res.status(HTTP_STATUS.OK_200).send({
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    });
  }
}
