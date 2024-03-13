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
import { User } from '../auth/guard/authGuard';
import { Request } from 'express';
import { PayloadType } from '../Token/jwt-service';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { BasicAuthGuard } from '../auth/guard/basic-authGuard';

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
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  async createNewUser(@Body() inputModel: UserBasicRequestBody) {
    const user = {
      login: inputModel.login,
      password: inputModel.password,
      email: inputModel.email,
    };
    return this.serviceUser.getNewUser(user);
  }
  @UseGuards(BasicAuthGuard)
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
