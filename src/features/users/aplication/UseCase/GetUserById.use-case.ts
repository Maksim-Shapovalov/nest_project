import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSQLTypeOrmRepository } from '../../infrastrucrue/User.repo.TypeORm';
import { User } from '../../domain/User.type';

export class GetUserByIdCommand {
  constructor(public userId: string) {}
}
@CommandHandler(GetUserByIdCommand)
export class GetUserByIdCase implements ICommandHandler<GetUserByIdCommand> {
  constructor(protected userSQLRepository: UserSQLTypeOrmRepository) {}
  async execute(command: GetUserByIdCommand): Promise<User | null> {
    const user = await this.userSQLRepository.getUserById(command.userId);
    return user ? user : null;
  }
}
