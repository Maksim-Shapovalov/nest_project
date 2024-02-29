// import { MongoMemoryServer } from 'mongodb-memory-server';
// import mongoose from 'mongoose';
// import { UserDocuments, UserSchema } from './Type/User.schemas';
// import { UserRepository } from './User.repository';
// import { UserPaginationQueryType } from "../qurey-repo/query-filter";
//
// describe('integration tests for UserRepository', () => {
//   let mongoServer: MongoMemoryServer;
//
//   beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const mongoUri = mongoServer.getUri();
//     await mongoose.connect(mongoUri);
//   });
//   afterAll(async () => {
//     await mongoose.disconnect();
//     await mongoServer.stop();
//   });
//   const userModel = mongoose.model<UserDocuments>('User', UserSchema);
//   const userRepository = new UserRepository(userModel);
//   // let newUser: UserToShow;
//   it('-GET should return all users, code 200', async () => {
//     await userRepository.getAllUsers(filter: UserPaginationQueryType );
//   });
// });
