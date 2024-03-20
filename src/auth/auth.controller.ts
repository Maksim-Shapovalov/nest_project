import {
  BadRequestException,
  Body,
  Controller,
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
import { userMapper, UserRepository } from '../Users/User.repository';
import { DeletedTokenRepoRepository } from '../Token/deletedTokenRepo-repository';
import { UserService } from '../Users/User.service';
import { AuthGuard, User } from './guard/authGuard';
import {
  FindUserByRecoveryCode,
  UserBasicRequestBody,
  UserMongoDbType,
} from '../Users/Type/User.type';
import { SecurityDeviceService } from '../Device/SecurityDevice.service';
import { injectable } from 'inversify';
import { ThrottlerGuard } from '@nestjs/throttler';

@injectable()
@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected deleteToken: DeletedTokenRepoRepository,
    protected serviceUser: UserService,
    protected userRepository: UserRepository,
    protected securityDeviceService: SecurityDeviceService,
    protected deletedTokenRepoRepository: DeletedTokenRepoRepository,
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
  @UseGuards(AuthGuard)
  @Post('refresh-token')
  async refreshToken(
    @Req() request: Request,
    @User() userModel: UserMongoDbType,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = userModel;
    const refreshTokenToRequest = request.cookies.refreshTokenToRequest;

    const token = await this.authService.updateJWT(
      userMapper(user),
      refreshTokenToRequest,
    ); //update

    if (!token) throw new NotFoundException();

    const { accessToken, refreshToken } = token;

    await this.deleteToken.deletedTokens(refreshTokenToRequest);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return accessToken;
  }
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() email: string) {
    const requestEmail = email;
    if (!requestEmail) throw new BadRequestException();
    await this.authService.sendEmailMessage(requestEmail);
    return HttpCode;
  }
  @Post('new-password')
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
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body('code') code: string) {
    const result = await this.authService.confirmatoryUser(code);
    if (!result) throw new NotFoundException();
    return HttpCode(204);
  }
  // @UseGuards(AuthGuard)
  @UseGuards(ThrottlerGuard)
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() bodyUser: UserBasicRequestBody) {
    const findUserInDB = await this.userRepository.findByLoginOrEmail(
      bodyUser.email,
    );
    if (findUserInDB) throw new BadRequestException('login');
    const newUser = await this.serviceUser.getNewUser(bodyUser);
    const findUser = await this.userRepository.findByLoginOrEmail(
      newUser.login,
    );
    await this.authService.doOperation(findUser);
    return HttpCode(204);
  }
  @Post('registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body('email') email: string) {
    const findUser: FindUserByRecoveryCode =
      await this.userRepository.findByLoginOrEmail(email);
    if (!findUser)
      throw new BadRequestException({
        message: 'email is not exist',
        field: 'email',
      });
    await this.authService.findUserByEmail(findUser);
    return HttpCode(204);
  }
  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(204)
  async logoutInApp(
    @Body() deviceIdInput: string,
    @Req() request: Request,
    @User() userModel: UserMongoDbType,
  ) {
    const user = userModel;
    const device = deviceIdInput;
    const token = request.cookies.refreshToken;

    const deletedDevice =
      await this.securityDeviceService.deletingDevicesExceptId(
        user._id.toString(),
        device,
      );
    const bannedToken =
      await this.deletedTokenRepoRepository.deletedTokens(token);

    if (!bannedToken) throw new BadRequestException();
    if (!deletedDevice) throw new BadRequestException();
    return HttpCode(204);
  }
  @UseGuards(AuthGuard)
  @Post('me')
  @HttpCode(204)
  async me(@Body() code: string, @User() userModel: UserMongoDbType) {
    if (!userModel) throw new UnauthorizedException();
    const result = await this.authService.confirmatoryUser(code);
    if (!result) throw new NotFoundException();
    return HttpCode(204);
  }
}
