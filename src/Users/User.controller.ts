import { injectable } from 'inversify';
import { UserRepository } from './User.repository';
import { UserService } from './User.service';
import { searchLogAndEmailInUsers } from '../qurey-repo/query-filter';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { QueryType } from '../Other/Query.Type';
import { UserBasicRequestBody, UserMongoDbType } from './Type/User.type';
import { isMongoIdPipe } from './user-chto-to';
import { AuthGuard, User } from '../authGuard';

@injectable()
@Controller('users')
export class UserController {
  constructor(
    protected userRepository: UserRepository,
    protected serviceUser: UserService,
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
    // @User() userModel: UserMongoDbType,
  ) {
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
