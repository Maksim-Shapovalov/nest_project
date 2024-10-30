import { AppModule } from '../../app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { setting } from '../../setting';
import { RouterPath } from '../../TestData/RouterPath';

describe(' tests for QuizGame', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).delete('/testing/all-data');
  });
  // beforeAll(async () => {
  //   await request(app.getHttpServer()).delete('testing/all-data');
  // });
  afterAll(async () => {
    await app.close();
  });
  it('should ', async () => {
    expect(1).toBe(1);
  });
  it('--POST create user', async () => {
    const login = setting.Username;
    const password = setting.Password;
    const response = await request(app.getHttpServer())
      .post(RouterPath.users)
      .auth(login, password)
      .send({
        login: 'hleb12',
        password: 'string',
        email: 'hleb.lukahonak@gmail.com',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        login: response.body.login,
        email: response.body.email,
        createdAt: expect.any(String),
      }),
    );
  });
});
