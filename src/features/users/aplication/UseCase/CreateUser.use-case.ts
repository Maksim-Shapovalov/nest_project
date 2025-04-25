import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../../api/dto/create.user.dto';
import { UserService } from '../User.service';

export class CreateUserCommand {
  constructor(public inputModel: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCase implements ICommandHandler<CreateUserCommand> {
  constructor(protected userService: UserService) {}
  async execute(command: CreateUserCommand) {
    return this.userService.createNewUser(command.inputModel);
  }
}
