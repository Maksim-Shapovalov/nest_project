// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import request from 'supertest';
// import { AppModule, HTTP_STATUS } from './../src/app.module';
// import { UserToShow } from '../src/Users/Type/User.type';
// import { ObjectId } from 'mongodb';
// import { appSettings } from '../src/app.settings';
// let user1: UserToShow;
// describe('AppController (e2e)', () => {
//   let app: INestApplication;
//   let HttpServer: any;
//
//   beforeAll(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     app = moduleFixture.createNestApplication();
//     appSettings(app);
//     HttpServer = app.getHttpServer();
//     await app.init();
//     await request(HttpServer).delete('/testing/all-data');
//   });
//   afterAll(() => {
//     app.close();
//   });
//
//   // it('/ (GET)', () => {
//   //   return request(app.getHttpServer())
//   //     .get('/')
//   //     .expect(200)
//   //     .expect('Hello World!');
//   // });
//
//   it('-GET all users', async () => {
//     return request(HttpServer)
//       .get('/users')
//       .expect(200)
//       .then((res) => {
//         expect(res.body.items.length).toBe(0);
//       });
//   });
//   it('-Post create one user and return code 201, and return all user by status 200', async () => {
//     await request(HttpServer)
//       .post('/users')
//       .send({
//         login: 'maksim2001',
//         password: 'maksim2001maksim',
//         email: 'maksim.shapovalov.01@gmail.com',
//       })
//       .expect(HTTP_STATUS.CREATED_201)
//       .then((res) => {
//         user1 = res.body;
//         expect(res.body).toEqual({
//           id: expect.any(String),
//           login: 'maksim2001',
//           email: 'maksim.shapovalov.01@gmail.com',
//           createdAt: expect.any(String),
//         });
//       });
//     console.log(user1);
//     await request(HttpServer)
//       .get('/users')
//       .expect(HTTP_STATUS.OK_200)
//       .then((res) => {
//         expect(res.body.items.length).toBe(1);
//         expect(res.body.items).toEqual([user1]);
//       });
//   });
//   it("--GET shouldn't return user by id, return code 404", async () => {
//     return request(HttpServer)
//       .get(`/users/${user1.id}1`)
//       .expect(HTTP_STATUS.NOT_FOUND_404);
//   });
//   it('--GET should return user by id, return code 200', async () => {
//     const user = await request(HttpServer).get(`/users/${user1.id}`);
//     expect(user.body).toEqual({
//       id: user1.id,
//       login: user1.login,
//       email: user1.email,
//       passwordHash: expect.any(String),
//       passwordSalt: expect.any(String),
//       createdAt: user1.createdAt,
//     });
//   });
//   it("--DELETE shouldn't delete user, return code 404", async () => {
//     return request(HttpServer)
//       .delete(`/users/${new ObjectId()}`)
//       .expect(HTTP_STATUS.NOT_FOUND_404);
//   });
//   it('--DELETE should delete user, return code 204', async () => {
//     return request(HttpServer)
//       .delete(`/users/${user1.id}`)
//       .expect(HTTP_STATUS.NO_CONTENT_204);
//   });
//   it("--DELETE shouldn't delete user, return code 400", async () => {
//     return request(HttpServer)
//       .delete(`/users/${new ObjectId()}1`)
//       .expect(HTTP_STATUS.BAD_REQUEST_400);
//   });
// });
