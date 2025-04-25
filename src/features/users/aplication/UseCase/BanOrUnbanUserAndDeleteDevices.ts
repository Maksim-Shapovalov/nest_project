import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserSQLTypeOrmRepository } from '../../infrastrucrue/User.repo.TypeORm';
import { SecurityDevicesSQLTypeOrmRepository } from '../../../device/infrastructure/Device.repo.TypeOrm';
import { BanUserDto } from '../../api/dto/update-ban.user.dto';

export class BanUserAndDeleteUserCommand {
  constructor(
    public userId: string,
    public solution: BanUserDto,
  ) {}
}

@CommandHandler(BanUserAndDeleteUserCommand)
export class BanUserAndDeleteDeviceCase
  implements ICommandHandler<BanUserAndDeleteUserCommand>
{
  constructor(
    public userSQLTypeOrmRepository: UserSQLTypeOrmRepository,
    public securityDevicesSQLTypeOrmRepository: SecurityDevicesSQLTypeOrmRepository,
  ) {}

  async execute(command: BanUserAndDeleteUserCommand): Promise<boolean> {
    const findUserInDBAndBanOrUnban =
      await this.userSQLTypeOrmRepository.findUserInDBAndBanOrUnban(
        command.userId,
        command.solution,
      );
    const deletedAllDeviceBannedUser =
      await this.securityDevicesSQLTypeOrmRepository.deletingAllDevicesByUserId(
        command.userId,
      );
    return findUserInDBAndBanOrUnban && deletedAllDeviceBannedUser;
  }
}
