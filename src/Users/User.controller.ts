import { injectable } from 'inversify';
import { UserRepository } from './User.repository';
import { UserService } from './User.service';
import { searchLogAndEmailInUsers } from '../qurey-repo/query-filter';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { QueryType } from '../Other/Query.Type';
import { UserBasicRequestBody, UserMongoDbType } from './Type/User.type';
import { isMongoIdPipe } from './user-chto-to';
import { AuthGuard, User } from '../authGuard';
import { Request } from 'express';
import { PayloadType } from '../Token/jwt-service';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

@injectable()
@Controller('users')
export class UserController {
  constructor(
    protected userRepository: UserRepository,
    protected serviceUser: UserService,
    // protected jwtService: JwtServiceToken,
  ) {}
  @Get()
  @HttpCode(200)
  async getAllUserInDB(@Query() query: QueryType) {
    const filter = searchLogAndEmailInUsers(query);
    return this.userRepository.getAllUsers(filter);
  }
  @Get(':id')
  @HttpCode(200)
  async getUserByCodeIdInDB(@Param('id') userId) {
    const user = await this.userRepository.getUserByIdWithMapper(
      userId.toString(),
    );
    if (!user) throw new NotFoundException();
    return user;
  }
  @Post()
  // @UseGuards(AuthGuard)
  @HttpCode(201)
  async createNewUser(
    @Body() inputModel: UserBasicRequestBody,
    @User() userModel: UserMongoDbType,
    @Headers() header,
    @Req() req: Request,
  ) {
    const refreshTokenToRequest = req.cookies.refreshTokenToRequest;

    // const tokenVerification = await this.jwtService.parseJWTRefreshToken(
    //   refreshTokenToRequest,
    // );
    const tokenVerification = jwt.decode(refreshTokenToRequest) as PayloadType;
    if (tokenVerification) {
      const findUser = await this.userRepository.getUserById(
        new ObjectId(tokenVerification.userId),
      );
      if (!findUser) throw new UnauthorizedException();
    } else throw new UnauthorizedException();

    const user = {
      login: inputModel.login,
      password: inputModel.password,
      email: inputModel.email,
    };
    return this.serviceUser.getNewUser(user);
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteUserInDB(@Param('id', isMongoIdPipe) userId) {
    const deletedUs = await this.serviceUser.deleteUserById(userId);
    if (!deletedUs) {
      throw new NotFoundException();
    }
    return HttpCode(204);
  }
}
