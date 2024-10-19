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
import { UserSQLTypeOrmRepository } from './TypeORM/User.repo.TypeORm';

@Controller('sa/users')
export class UserController {
  constructor(
    protected userSQLRepository: UserSQLTypeOrmRepository,
    protected userRepository: UserRepository,
    protected serviceUser: UserService,
  ) {}
  @Get()
  @HttpCode(200)
  async getAllUserInDB(@Query() query: QueryType) {
    const filter = searchLogAndEmailInUsers(query);
    return this.userSQLRepository.getAllUsers(filter);
  }
  @Get(':id')
  @HttpCode(200)
  async getUserByCodeIdInDB(@Param('id') userId) {
    if (!userId) throw new NotFoundException();
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
    const findUser = await this.userSQLRepository.findByLoginAndEmail(
      user.login,
      user.email,
    );
    if (!findUser) throw new BadRequestException();
    return this.serviceUser.getNewUser(user);
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteUserInDB(@Param('id') userId) {
    if (!userId) throw new NotFoundException();
    await this.serviceUser.deleteUserById(userId);
    return HttpCode(204);
  }
}
// async deleteUserInDB(@Param('id', isMongoIdPipe) userId) {
