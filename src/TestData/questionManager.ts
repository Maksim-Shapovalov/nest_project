import { INestApplication } from '@nestjs/common';
import { setting } from '../setting';
import request from 'supertest';
import { RouterPath } from './RouterPath';
import { HTTP_STATUS } from '../app.module';
import { requestBodyQuestionToCreate } from '../quiz/type/question.type';
import { AnswerInput } from '../quiz/type/QuizGame.type';

export const questionTestManager = (app: INestApplication) => ({
  async createQuestions(body: requestBodyQuestionToCreate) {
    const login = setting.Username;
    const password = setting.Password;
    return request(app.getHttpServer())
      .post(RouterPath.question)
      .auth(login, password)
      .send(body)
      .expect(HTTP_STATUS.CREATED_201);
  },
  async addAnswer(body: AnswerInput, user: string) {
    const createAnswer = await request(app.getHttpServer())
      .post(`${RouterPath.quizGame}/my-current/answers`)
      .set('Authorization', `Bearer ${user}`)
      .send(body)
      .expect(HTTP_STATUS.OK_200);
    expect(createAnswer.body).toEqual(
      expect.objectContaining({
        questionId: expect.any(String),
        answerStatus: expect.stringMatching(/^(Incorrect|Correct)$/),
        addedAt: expect.any(String),
      }),
    );
    return createAnswer.body;
  },
  async requestForMyCurrentGame(user: string) {
    return request(app.getHttpServer())
      .get(`${RouterPath.quizGame}/my-current`)
      .set('Authorization', `Bearer ${user}`)
      .expect(HTTP_STATUS.OK_200);
  },
  async getRequestForQuizGameForId(pairId: string, accessToken: string) {
    return request(app.getHttpServer())
      .get(`${RouterPath.quizGame}/${pairId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HTTP_STATUS.OK_200);
  },
});
