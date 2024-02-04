import { injectable } from 'inversify';
import { UserRepository } from './User.repository';
import { UserService } from './User.service';
import { searchLogAndEmailInUsers } from '../qurey-repo/query-filter';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { QueryType } from '../Other/Query.Type';
import { UserBasicRequestBody } from './Type/User.type';

@injectable()
@Controller('users')
export class UserController {
  constructor(
    protected userRepository: UserRepository,
    protected serviceUser: UserService,
  ) {}
  @Get()
  async getAllUserInDB(@Query() query: QueryType) {
    const filter = searchLogAndEmailInUsers(query);
    return this.userRepository.getAllUsers(filter);
  }
  @Get(':id')
  async getUserByCodeIdInDB(@Param('id') userId) {
    return this.userRepository.getUserByIdWithMapper(userId.toString());
  }
  @Post()
  async createNewUser(@Body() inputModel: UserBasicRequestBody) {
    const user = {
      login: inputModel.login,
      password: inputModel.password,
      email: inputModel.email,
    };
    return this.serviceUser.getNewUser(user);
  }
  @Delete(':id')
  async deleteUserInDB(@Param('id') userId) {
    const deletedUs = await this.serviceUser.deleteUserById(userId);
    if (!deletedUs) {
      return;
    }
    return;
  }
}
