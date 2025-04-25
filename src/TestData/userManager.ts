import request from 'supertest';
import { RouterPath } from './RouterPath';
import { INestApplication } from '@nestjs/common';
import { setting } from '../setting';
import { BodyUserToLogin } from '../features/users/domain/User.type';
import { HTTP_STATUS } from '../app.module';
import { BanUserDto } from '../features/users/api/dto/update-ban.user.dto';
import { CreateUserDto } from '../features/users/api/dto/create.user.dto';

export const usersTestManager = (app: INestApplication) => ({
  async createUser(body: BanUserDto) {
    const login = setting.Username;
    const password = setting.Password;
    return request(app.getHttpServer())
      .post(RouterPath.users)
      .auth(login, password)
      .send(body)
      .expect(HTTP_STATUS.CREATED_201);
  },
  async loginUser(body: BodyUserToLogin) {
    return request(app.getHttpServer())
      .post(`${RouterPath.loginUser}/login`)
      .send(body)
      .expect(HTTP_STATUS.OK_200);
  },
  async createUserAndLogin(bodyToCreate: CreateUserDto) {
    const login = setting.Username;
    const password = setting.Password;
    const responseToCreate = await request(app.getHttpServer())
      .post(RouterPath.users)
      .auth(login, password)
      .send(bodyToCreate)
      .expect(HTTP_STATUS.CREATED_201);
    const bodyToLogin: BodyUserToLogin = {
      loginOrEmail: responseToCreate.body.login,
      password: bodyToCreate.password,
    };
    return request(app.getHttpServer())
      .post(`${RouterPath.loginUser}/login`)
      .send(bodyToLogin)
      .expect(HTTP_STATUS.OK_200);
  },
  // async findPlayerById(body: UserBasicRequestBody) {
  //   const login = setting.Username;
  //   const password = setting.Password;
  //   return request(app.getHttpServer())
  //     .post(RouterPath.users)
  //     .auth(login, password)
  //     .send(body)
  //     .expect(HTTP_STATUS.CREATED_201);
  // },
});
