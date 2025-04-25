import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../aplication/service/auth.service';
import { Request, Response } from 'express';
import { BearerGuard } from '../../../core/guard/authGuard';
import { NewestPostLike, User } from '../../users/domain/User.type';
import { SecurityDeviceService } from '../../device/aplication/SecurityDevice.service';
import { Ip } from '@nestjs/common/decorators/http/route-params.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  CustomRequest,
  TokenRefreshGuard,
} from '../../../core/guard/token-guard';
import { UserSQLTypeOrmRepository } from '../../users/infrastrucrue/User.repo.TypeORm';
import { UserAgent } from '../../../core/decorators/userAgent.decorator';
import { LoginDto } from './dto/loginDto';
import { CommandBus } from '@nestjs/cqrs';
import { loginCommand } from '../aplication/useCase/login-useCase';
import { CurrentUserId } from '../../../core/decorators/currentUserId.decorator';
import { Cookie } from '../../../core/decorators/cookie.decorator';
import {
  Notification,
  ResultStatus,
} from '../../../core/notification/notification';
import { CreateUserDto } from '../../users/api/dto/create.user.dto';
import { UserService } from '../../users/aplication/User.service';
import { LocalAuthGuard } from '../../../core/guard/local-auth.guard';
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected userSQLRepository: UserSQLTypeOrmRepository,
    protected userService: UserService,
    protected securityDeviceService: SecurityDeviceService,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @HttpCode(200)
  async loginInApp(
    @CurrentUserId() userId: string,
    @Headers() header,
    @Cookie('refreshToken') refreshToken: string,
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
    @Ip() ip: string,
    @UserAgent() userAgent: string,
  ) {
    const result: Notification<null | {
      accessToken: string;
      refreshToken: string;
    }> = await this.commandBus.execute<
      loginCommand,
      Notification<null | {
        accessToken: string;
        refreshToken: string;
      }>
    >(new loginCommand(userId, ip, userAgent, refreshToken));
    if (result.status === ResultStatus.Unauthorized || !result.data) {
      throw new UnauthorizedException(result.errorMessage);
    }

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    response.status(HttpStatus.OK).send({
      accessToken: result.data.accessToken,
    });
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
  async registration(@Body() bodyUser: CreateUserDto) {
    const findUserInDB =
      await this.userSQLRepository.findByLoginOrEmailByOneUser(
        bodyUser.login,
        bodyUser.email,
      );
    if (findUserInDB) {
      if (findUserInDB.getLogin() === bodyUser.login) {
        throw new BadRequestException({
          message: 'login is not exist',
          field: 'login',
        });
      } else if (findUserInDB.getEmail() === bodyUser.email) {
        throw new BadRequestException({
          message: 'email is not exist',
          field: 'email',
        });
      }
    }

    const newUser = await this.userService.createNewUser(bodyUser);
    const findUser = await this.userSQLRepository.findByLoginOrEmail(
      newUser.login,
    );
    await this.authService.doOperation(findUser);
    return HttpCode(204);
  }
  @Post('/registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body('email') email: string) {
    const findUser: User =
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
    // const token = request.cookies.refreshToken;

    const deletedDevice =
      await this.securityDeviceService.deletingDevicesExceptId(
        userId,
        deviceId,
      );
    if (!deletedDevice) throw new BadRequestException();
  }
  @UseGuards(BearerGuard)
  @Get('/me')
  @HttpCode(200)
  async me(@Req() request) {
    const user = request.user as NewestPostLike;
    if (!user) throw new UnauthorizedException();
    const result = await this.userSQLRepository.getUserById(user.userId);
    return {
      email: result.getEmail(),
      login: result.getLogin(),
      userId: result.getId(),
    };
  }
  //@User() userModel: UserMongoDbType
}
