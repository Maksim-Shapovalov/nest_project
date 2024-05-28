import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { UserService } from '../User.service';
import { UserRepository } from '../User.repository';
import { UserDocuments, UserSchema } from '../Type/User.schemas';
import { UserToShow } from '../Type/User.type';
import { HTTP_STATUS } from '../../app.module';

describe('integration tests for UserService', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  const userModel = mongoose.model<UserDocuments>('User', UserSchema);
  const userRepository = new UserRepository(userModel);
  const userService = new UserService(userRepository);
  let newUser: UserToShow;
  it('-GET should create user, code 200', async () => {
    const user = {
      login: 'maksim2001',
      password: '1234',
      email: 'maksim.shapovalov,2001@gmail.com',
    };
    const result = await userService.getNewUser(user);
    newUser = result;
    expect(result.login).toEqual('maksim2001');
    expect(result.email).toEqual('maksim.shapovalov,2001@gmail.com');
    expect(result.id).toEqual(expect.any(String));
  });
  it('-Delete should delete users and return code 204 ', async () => {
    const userId = newUser.id;
    const result = await userService.deleteUserById(userId);
    expect(result).toEqual(true);
    expect(HTTP_STATUS.NO_CONTENT_204).toEqual(HTTP_STATUS.NO_CONTENT_204);
  });
});
