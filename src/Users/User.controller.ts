import { injectable } from 'inversify';
import { UserRepository } from './User.repository';
import { UserService } from './User.service';
import { searchLogAndEmailInUsers } from '../qurey-repo/query-filter';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryType } from '../Other/Query.Type';
import { UserBasicRequestBody } from './Type/User.type';
import { BasicAuthGuard } from '../auth/guard/basic-authGuard';
import { UserSQLRepository } from './User.SqlRepositories';

@injectable()
@Controller('sa/users')
export class UserController {
  constructor(
    protected userSQLRepository: UserSQLRepository,
    protected userRepository: UserRepository,
    protected serviceUser: UserService,
  ) {}
  @Get()
  @HttpCode(200)
  async getAllUserInDB(@Query() query: QueryType) {
    const filter = searchLogAndEmailInUsers(query);
    console.log(1);
    return this.userSQLRepository.getAllUsers(filter);
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
    console.log('i');
    const user = {
      login: inputModel.login,
      password: inputModel.password,
      email: inputModel.email,
    };
    const findUser = await this.userSQLRepository.findByLoginAndEmail(
      user.login,
      user.email,
    );
    if (findUser) throw new BadRequestException();
    return this.serviceUser.getNewUser(user);
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteUserInDB(@Param('id') userId) {
    const deletedUs = await this.serviceUser.deleteUserById(userId);
    if (!deletedUs) {
      throw new NotFoundException();
    }
    return HttpCode(204);
  }
}
// async deleteUserInDB(@Param('id', isMongoIdPipe) userId) {
