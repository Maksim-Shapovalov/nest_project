import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule, HTTP_STATUS } from '../src/app.module';
import { appSettings } from '../src/app.settings';
import request from 'supertest';
import mongoose from 'mongoose';
import { BlogsOutputModel } from '../src/Blogs/Type/Blogs.type';
let blogInDb: BlogsOutputModel;
describe('Blogs e2e', () => {
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

  const blogData = {
    name: 'test',
    description: 'description_test',
    websiteUrl: 'https://test.com',
  };
  const updateBlogForData = {
    name: 'jestTest',
    description: 'description_test_jest',
    websiteUrl: 'https://test.com',
  };

  const blogs: any[] = [];
  for (let i = 1; i < 13; i++) {
    blogs.push({
      name: `${blogData.name} ${i}`,
      description: `${blogData.description} ${i}`,
      websiteUrl: `https://google.com`,
    });
  }

  it('-Get should return empty array blogs', async () => {
    return request(httpServer)
      .get('/blogs')
      .expect(200)
      .then((res) => expect(res.body.items.length).toBe(0));
  });
  it('-Post should create blog and return ', async () => {
    await request(httpServer)
      .post('/blogs')
      .auth(adminData.login, adminData.password)
      .send(blogData)
      .expect(HTTP_STATUS.CREATED_201)
      .then((res) => {
        blogInDb = res.body;
        expect(res.body).toEqual({
          id: expect.any(String),
          name: blogInDb.name,
          description: blogInDb.description,
          websiteUrl: blogInDb.websiteUrl,
          createdAt: expect.any(String),
          isMembership: false,
        });
      });
    console.log(blogInDb);
    await request(httpServer)
      .get(`/blogs/${blogInDb.id}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          id: blogInDb.id,
          name: blogInDb.name,
          description: blogInDb.description,
          websiteUrl: blogInDb.websiteUrl,
          createdAt: expect.any(String),
          isMembership: false,
        });
      });
  });
  it("-Post shouldn't create blog and return error ", async () => {
    await request(httpServer)
      .post('/blogs')
      .auth(adminData.login, adminData.password)
      .send({
        name: '',
        description: 'description_test',
        websiteUrl: 'hs://test.com',
      })
      .expect(HTTP_STATUS.BAD_REQUEST_400)
      .then((res) => {
        expect(res.body.errorsMessages[0].field).toBe('name');
        expect(res.body.errorsMessages[1].field).toBe('websiteUrl');
      });
  });
  it('-Get should return array blogs, length = 1', async () => {
    return request(httpServer)
      .get('/blogs')
      .expect(200)
      .then((res) => expect(res.body.items.length).toBe(1));
  });
  it("-Get shouldn't return blog by id, length = 0", async () => {
    return request(httpServer).get('/blogs/1234').expect(404);
  });
  it('-Update blogs by id should return HTTP CODE 204', async () => {
    console.log(blogInDb, 'blogInDb-----');
    await request(httpServer)
      .put(`/blogs/${blogInDb.id}`)
      .auth(adminData.login, adminData.password)
      .send(updateBlogForData)
      .expect(204);
    await request(httpServer)
      .get(`/blogs/${blogInDb.id}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          id: blogInDb.id,
          name: updateBlogForData.name,
          description: updateBlogForData.description,
          websiteUrl: updateBlogForData.websiteUrl,
          createdAt: expect.any(String),
          isMembership: false,
        });
      });
  });
  it('should delete blog by id and return http code 204, find user by id should return error 404', async () => {
    await request(httpServer)
      .delete(`/blogs/${blogInDb.id}`)
      .auth(adminData.login, adminData.password)
      .expect(204);
    return request(httpServer).get(`/blogs/${blogInDb.id}`).expect(404);
  });
});
