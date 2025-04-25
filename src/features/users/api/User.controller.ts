import { searchLogAndEmailInUsers } from '../../validate-middleware/query-filter';
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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryType } from '../../validate-middleware/Query.Type';
import { BasicAuthGuard } from '../../../core/guard/basic-authGuard';
import { UserSQLTypeOrmRepository } from '../infrastrucrue/User.repo.TypeORm';
import { CustomUUIDValidation } from '../../../core/decorators/validator.validateUUID';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserAndDeleteUserCommand } from '../aplication/UseCase/BanOrUnbanUserAndDeleteDevices';
import { CreateUserDto } from './dto/create.user.dto';
import { BanUserDto } from './dto/update-ban.user.dto';
import { CreateUserCommand } from '../aplication/UseCase/CreateUser.use-case';
import { GetUserByIdCommand } from '../aplication/UseCase/GetUserById.use-case';
import { DeleteUserCommand } from '../aplication/UseCase/DeleteUser.use-case';
@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UserController {
  constructor(
    protected userSQLRepository: UserSQLTypeOrmRepository,
    private readonly customUUIDValidation: CustomUUIDValidation,
    private commandBus: CommandBus,
  ) {}
  @Get()
  @HttpCode(200)
  async getAllUserInDB(@Query() query: QueryType) {
    const filter = searchLogAndEmailInUsers(query);
    return this.userSQLRepository.getAllUsers(filter);
  }
  @Get(':id')
  @HttpCode(200)
  async getUserByCodeIdInDB(@Param('id') userId: string) {
    if (!userId) throw new BadRequestException();
    const user = await this.commandBus.execute(new GetUserByIdCommand(userId));
    // if (!user) throw new NotFoundException();
    return user ? user : new NotFoundException();
  }

  @Post()
  @HttpCode(201)
  async createNewUser(@Body() inputModel: CreateUserDto) {
    const findUser = await this.userSQLRepository.findByLoginAndEmail(
      inputModel.login,
      inputModel.email,
    );
    if (findUser) throw new BadRequestException();
    return this.commandBus.execute(new CreateUserCommand(inputModel));
  }
  @Put(':id/ban')
  @HttpCode(200)
  async bannedUserById(@Param('id') userId, @Body() body: BanUserDto) {
    if (!userId || !this.customUUIDValidation.validate(userId))
      throw new NotFoundException();
    // const user = await this.userRepository.getUserByIdWithMapper(userId);
    const user = await this.commandBus.execute(
      new BanUserAndDeleteUserCommand(userId, body),
    );
    if (!user) throw new NotFoundException();
    return user;
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteUserInDB(@Param('id') userId: string) {
    if (!userId) throw new BadRequestException();
    const user = await this.commandBus.execute(new DeleteUserCommand(userId));
    if (!user) throw new NotFoundException();
    return HttpCode(204);
  }
}
