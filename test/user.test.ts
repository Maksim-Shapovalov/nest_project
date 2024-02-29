import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  describe('work user', () => {
    it('-GET all users', async () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .then((res) => {
          expect(res.body.items.length).toBe(0);
        });
    });
  });
});
