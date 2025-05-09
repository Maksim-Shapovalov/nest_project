import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../api/auth.controller';
import { UserController } from '../../users/api/User.controller';
import { UserRepository } from '../Users/User.repository';
import { UserBasicRequestBody } from '../../users/domain/User.type';
import { BasicAuthGuard } from '../../../core/guard/basic-authGuard';

describe('AuthController', () => {
  let controller: AuthController;
  let userController: UserController;
  let userRepo: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, UserController],
      providers: [UserRepository, BasicAuthGuard],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userController = module.get<UserController>(UserController);
  });

  it('create User and login', async () => {
    const userInputModel: UserBasicRequestBody = {
      login: 'tester',
      password: 'password',
      email: 'testuser@example.com',
    };
    const createdUser = await userController.createNewUser(userInputModel);
    expect(createdUser).toBeDefined();
  });
});
