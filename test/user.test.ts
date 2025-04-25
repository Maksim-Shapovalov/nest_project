import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/app.settings';
import request from 'supertest';
import mongoose from 'mongoose';
import { UserOutputModel } from '../src/features/users/domain/User.type';
let userInDB: UserOutputModel;
describe('Users e2e', () => {
  let app: INestApplication;
  let httpServer;
  //let mongoServer: MongoMemoryServer;
  // let blogTestManaget: BlogTestManager;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();

    //init blogTestManager
    // blogTestManaget = new BlogTestManager(app);
    await request(httpServer).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
    await mongoose.disconnect();
  });

  const adminData = {
    login: 'admin',
    password: 'qwerty',
  };

  const userDara = {
    login: 'login',
    email: 'maksim.shapovalov@gmail.com',
    password: 'password',
  };
  it('-Get should return empty array user', async () => {
    return request(httpServer)
      .get('/users')
      .expect(200)
      .then((res) => expect(res.body.items.length).toBe(0));
  });
  it('-POST should create user, return HTTP code 201. Request Get-user should return array 1 length ', async () => {
    await request(httpServer)
      .post('/users')
      .auth(adminData.login, adminData.password)
      .send(userDara)
      .expect(201)
      .then((res) => {
        userInDB = res.body;
        expect(res.body).toEqual({
          id: expect.any(String),
          login: userDara.login,
          email: userDara.email,
          createdAt: expect.any(String),
        });
        console.log(userInDB);
      });
    await request(httpServer)
      .get('/users')
      .expect(200)
      .then((res) => {
        expect(res.body.items.length).toBe(1);
        expect(res.body.items).toEqual([userInDB]);
      });
  });
  it("-POST shouldn't create user, return http status 400 bad request", async () => {
    await request(httpServer)
      .post('/users')
      .auth(adminData.login, adminData.password)
      .send({
        login: '',
        email: '',
        password: '',
      })
      .expect(400)
      .then((res) => {
        expect(res.body.errorsMessages[0].field).toBe('login');
        expect(res.body.errorsMessages[1].field).toBe('password');
        expect(res.body.errorsMessages[2].field).toBe('email');
      });
  });
  it('-GET should return array users length = 1 ', async () => {
    return request(httpServer)
      .get('/users')
      .expect(200)
      .then((res) => expect(res.body.items.length).toBe(1));
  });
  it('-DELETE should delete users by id. GET should return array users length = 0 ', async () => {
    await request(httpServer)
      .delete(`/users/${userInDB.id}`)
      .auth(adminData.login, adminData.password)
      .expect(204);
    return request(httpServer)
      .get('/users')
      .expect(200)
      .then((res) => expect(res.body.items.length).toBe(0));
  });
});
