import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { UserService } from '../Users/User.service';
import { BearerGuard } from './guard/authGuard';
import {
  FindUserByRecoveryCode,
  NewestPostLike,
  UserBasicRequestBody,
} from '../Users/Type/User.type';
import { SecurityDeviceService } from '../Device/SecurityDevice.service';

import { ThrottlerGuard } from '@nestjs/throttler';
import { RefreshTokenRepo } from '../Token/refreshToken-repo';
import { CustomRequest, TokenRefreshGuard } from '../Token/token-guard';
import { UserSQLTypeOrmRepository } from '../Users/TypeORM/User.repo.TypeORm';
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected serviceUser: UserService,
    protected userSQLRepository: UserSQLTypeOrmRepository,
    protected securityDeviceService: SecurityDeviceService,
    protected refreshTokenRepo: RefreshTokenRepo,
  ) {}
  @Post('/login')
  @HttpCode(200)
  async loginInApp(
    @Headers() header,
    @Body() body: { loginOrEmail: string; password: string },
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ) {
    const userAgent = {
      IP: req.ip,
      deviceName: header['user-agent'],
    };

    const { accessToken, refreshToken } = await this.authService.signIn(
      body,
      userAgent,
    );

    if (!accessToken || !refreshToken) throw new UnauthorizedException();

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }
  @UseGuards(TokenRefreshGuard)
  @Post('/refresh-token')
  @HttpCode(200)
  async refreshToken(
    @Req() request: CustomRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { userId } = request.token;
    const refreshTokenToRequest = request.cookies.refreshToken;
    const token = await this.authService.updateJWT(
      userId,
      refreshTokenToRequest,
    );

    if (!token) throw new NotFoundException();
    const { accessToken, refreshToken } = token;

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken };
  }
  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() email: string) {
    const requestEmail = email;
    if (!requestEmail) throw new BadRequestException();
    await this.authService.sendEmailMessage(requestEmail);
    return HttpCode;
  }
  @Post('/new-password')
  @HttpCode(204)
  async newPassword(
    @Body() bodyRequest = { newPassword: String, recoveryCode: String },
  ) {
    const requestEmail = {
      newPassword: bodyRequest.newPassword.toString(),
      recoveryCode: bodyRequest.recoveryCode.toString(),
      newSalt: '',
    };
    if (!requestEmail) throw new BadRequestException();
    const user = await this.authService.findUserByRecoveryCode(requestEmail);
    if (!user) throw new BadRequestException();
    return HttpCode;
  }
  @Post('/registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body('code') code: string) {
    const result = await this.authService.confirmatoryUser(code);
    if (!result)
      throw new BadRequestException({
        message: 'code is not exist',
        field: 'code',
      });
    return HttpCode(204);
  }
  // @UseGuards(AuthGuard)

  @Post('/registration')
  @HttpCode(204)
  async registration(@Body() bodyUser: UserBasicRequestBody) {
    const findUserInDB =
      await this.userSQLRepository.findByLoginOrEmailByOneUser(
        bodyUser.login,
        bodyUser.email,
      );
    if (findUserInDB) {
      if (findUserInDB.login === bodyUser.login) {
        throw new BadRequestException({
          message: 'login is not exist',
          field: 'login',
        });
      } else if (findUserInDB.email === bodyUser.email) {
        throw new BadRequestException({
          message: 'email is not exist',
          field: 'email',
        });
      }
    }

    const newUser = await this.serviceUser.getNewUser(bodyUser);
    const findUser = await this.userSQLRepository.findByLoginOrEmail(
      newUser.login,
    );
    await this.authService.doOperation(findUser);
    return HttpCode(204);
  }
  @Post('/registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body('email') email: string) {
    const findUser: FindUserByRecoveryCode =
      await this.userSQLRepository.findByLoginOrEmail(email);
    if (!findUser)
      throw new BadRequestException({
        message: 'email is not exist',
        field: 'email',
      });
    await this.authService.findUserByEmail(findUser);
    return HttpCode(204);
  }
  @UseGuards(TokenRefreshGuard)
  @Post('/logout')
  @HttpCode(204)
  async logoutInApp(@Req() request: CustomRequest) {
    const { userId, deviceId } = request.token;
    const token = request.cookies.refreshToken;

    const deletedDevice =
      await this.securityDeviceService.deletingDevicesExceptId(
        +userId,
        +deviceId,
      );
    const validToken =
      await this.refreshTokenRepo.DeleteRefreshTokenInData(token);

    if (!validToken) throw new BadRequestException();

    if (!deletedDevice) throw new BadRequestException();
  }
  @UseGuards(BearerGuard)
  @Get('/me')
  @HttpCode(200)
  async me(@Req() request) {
    const user = request.user as NewestPostLike;
    if (!user) throw new UnauthorizedException();
    const result = await this.userSQLRepository.getUserById(+user.userId);
    return {
      email: result.email,
      login: result.login,
      userId: result.id.toString(),
    };
  }
  //@User() userModel: UserMongoDbType
}
