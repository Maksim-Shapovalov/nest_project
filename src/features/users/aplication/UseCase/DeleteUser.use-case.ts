import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSQLTypeOrmRepository } from '../../infrastrucrue/User.repo.TypeORm';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected userSQLRepository: UserSQLTypeOrmRepository) {}
  async execute(command: DeleteUserCommand) {
    return this.userSQLRepository.deleteUserById(command.userId);
  }
}
