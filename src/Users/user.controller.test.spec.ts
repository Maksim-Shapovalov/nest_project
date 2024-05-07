// import { MongoMemoryServer } from 'mongodb-memory-server';
// import mongoose from 'mongoose';
// import { UserService } from './User.service';
// import { UserRepository } from './User.repository';
// import { UserDocuments, UserSchema } from './Type/User.schemas';
// import { UserController } from './User.controller';
//
// describe('integration tests for UserController', () => {
//   let mongoServer: MongoMemoryServer;
//
//   beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const mongoUri = mongoServer.getUri();
//     await mongoose.connect(mongoUri);
//   });
//   const userModel = mongoose.model<UserDocuments>('User', UserSchema);
//   const userRepository = new UserRepository(userModel);
//   const userService = new UserService(userRepository);
//   const userController = new UserController(userRepository, userService);
//   it('-GET should return ampty array ', async () => {});
// });
