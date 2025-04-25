import { User } from '../domain/User.type';
import { Injectable } from '@nestjs/common';
import { UserSQLTypeOrmRepository } from '../infrastrucrue/User.repo.TypeORm';
import { CreateUserDto } from '../api/dto/create.user.dto';
import { CryptoService } from '../../../core/service/crypto/crypro.service';
@Injectable()
export class UserService {
  constructor(
    protected userSQLRepository: UserSQLTypeOrmRepository,
    protected cryptoService: CryptoService,
  ) {}
  async createNewUser(body: CreateUserDto) {
    const { login, password, email } = body;
    const passwordSalt = await this.cryptoService.genSalt(10);
    const passwordHash = await this.cryptoService.createHash(
      password,
      passwordSalt,
    );
    const newUser = User.create(login, passwordHash, email);
    console.log(newUser, '----------newUser');
    return this.userSQLRepository.saveUser(newUser);
  }
}
