import { AppModule, HTTP_STATUS } from '../../app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { usersTestManager } from '../../TestData/userManager';
import { RouterPath } from '../../TestData/RouterPath';
import { questionTestManager } from '../../TestData/questionManager';
import { setting } from '../../setting';
import { questionBody } from '../type/question.type';
import { StatusTypeEnum } from '../type/QuizGame.type';

describe(' tests for QuizGame', () => {
  jest.setTimeout(100000);
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).delete(RouterPath.dataClear);

    const firstUserBody = {
      login: 'hleb121',
      password: 'string',
      email: 'hleb.lukahonak@gmail.com',
    };
    const secondUserBody = {
      login: 'hleb12',
      password: 'string',
      email: 'hleb.lukahonak@gmail.com',
    };
    [createResponseFirstUser, createResponseSecondUser] = await Promise.all([
      usersTestManager(app).createUserAndLogin(firstUserBody),
      usersTestManager(app).createUserAndLogin(secondUserBody),
    ]);

    expect(createResponseFirstUser.body).toEqual(
      expect.objectContaining({ accessToken: expect.any(String) }),
    );
    expect(createResponseSecondUser.body).toEqual(
      expect.objectContaining({ accessToken: expect.any(String) }),
    );
  });
  afterAll(async () => {
    await app.close();
  });
  let createResponseFirstUser;
  let createResponseSecondUser;
  let questions: questionBody[];
  const login = setting.Username;
  const password = setting.Password;
  let filterQuestionsByPublish;
  let firstGameHave1playerAnd2Player;

  it('--POST create questions ', async () => {
    for (let i = 0; i <= 10; i++) {
      const bodyToCreateQuestion = {
        body: 'question' + i,
        correctAnswers: ['correct answer'],
      };
      await questionTestManager(app).createQuestions(bodyToCreateQuestion);
    }
    const findQuestion = await request(app.getHttpServer())
      .get(RouterPath.question)
      .auth(login, password)
      .expect(HTTP_STATUS.OK_200);
    expect(findQuestion.body.items[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        body: expect.any(String),
        correctAnswers: ['correct answer'],
        published: false,
        createdAt: expect.any(String),
        updatedAt: null,
      }),
    );
    questions = findQuestion.body.items;
    expect(findQuestion.body.items).toHaveLength(10);
  });

  it('--PUT published 5 questions ', async () => {
    const fiveQuestions = questions.slice(0, 5);
    for (let i = 0; i < fiveQuestions.length; i++) {
      const updatedQuestion = await request(app.getHttpServer())
        .put(`${RouterPath.question}/${fiveQuestions[i].id}/publish`)
        .auth(login, password)
        .send({ published: true });
      expect(updatedQuestion.status).toBe(204);
    }
    const findQuestions = await request(app.getHttpServer())
      .get(`${RouterPath.question}`)
      .auth(login, password);
    filterQuestionsByPublish = findQuestions.body.items.filter(
      (questions) => questions.published === true,
    );
    expect(fiveQuestions.length).toBe(5);
    expect(filterQuestionsByPublish.length).toBeGreaterThan(0);
    const allPublished = filterQuestionsByPublish.every(
      (question) =>
        question.published === true && typeof question.updatedAt === 'string',
    );
    expect(allPublished).toBe(true);
  });
  it('--POST should create quiz pair of 1 player ', async () => {
    const createQuizGame1Player = await request(app.getHttpServer())
      .post(`${RouterPath.quizGame}/connection`)
      .set(
        'Authorization',
        `Bearer ${createResponseFirstUser.body.accessToken}`,
      );
    expect(createQuizGame1Player.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: expect.any(String),
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: StatusTypeEnum.PendingSecondPlayer,
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });
  });
  it('--POST should create quiz pair 2 player ', async () => {
    const mappingQuestions = filterQuestionsByPublish.map((q) => ({
      body: q.body,
      id: q.id,
    }));
    const createQuizGame2Player = await request(app.getHttpServer())
      .post(`${RouterPath.quizGame}/connection`)
      .set(
        'Authorization',
        `Bearer ${createResponseSecondUser.body.accessToken}`,
      );
    firstGameHave1playerAnd2Player = createQuizGame2Player.body;
    expect(createQuizGame2Player.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: expect.any(String),
        },
        score: 0,
      },
      secondPlayerProgress: {
        answers: [],
        player: {
          id: expect.any(String),
          login: expect.any(String),
        },
        score: 0,
      },
      questions: expect.arrayContaining(mappingQuestions),
      status: StatusTypeEnum.Active,
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });
  it('--POST should return 403 error', async () => {
    const bodyCorrect = {
      answer: 'correct answer',
    };
    const user3Body = {
      login: 'maksim2001',
      password: 'string',
      email: 'hleb.lukahonak.12321@gmail.com',
    };
    const createUser3 =
      await usersTestManager(app).createUserAndLogin(user3Body);
    const getPairById = await request(app.getHttpServer())
      .get(`${RouterPath.quizGame}/${firstGameHave1playerAnd2Player.id}`)
      .set('Authorization', `Bearer ${createUser3.body.accessToken}`)
      .expect(HTTP_STATUS.Forbidden_403);
    expect(getPairById.status).toBe(HTTP_STATUS.Forbidden_403);
    await request(app.getHttpServer())
      .post(`${RouterPath.quizGame}/my-current/answers`)
      .set('Authorization', `Bearer ${createUser3.body.accessToken}`)
      .send(bodyCorrect)
      .expect(HTTP_STATUS.Forbidden_403);
  });
  it('--POST created answer 1 and 2 player, 1 player should win ', async () => {
    const bodyCorrect = {
      answer: 'correct answer',
    };
    const bodyIncorrect = {
      answer: 'Incorrect answer',
    };
    // createResponseFirstUser;
    // createResponseSecondUser;
    const createFirstAnswer1 = await questionTestManager(app).addAnswer(
      bodyCorrect,
      createResponseFirstUser.body.accessToken,
    );
    const myCurrent = await questionTestManager(app).requestForMyCurrentGame(
      createResponseFirstUser.body.accessToken,
    );
    expect(myCurrent.body.firstPlayerProgress.answers).toHaveLength(1);
    expect(myCurrent.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        firstPlayerProgress: {
          answers: expect.arrayContaining([
            expect.objectContaining({
              questionId: createFirstAnswer1.questionId,
              answerStatus: createFirstAnswer1.answerStatus,
              addedAt: expect.any(String),
            }),
          ]),
          player: {
            id: expect.any(String),
            login: 'hleb121',
          },
          score: 1,
        },
      }),
    );
    await questionTestManager(app).requestForMyCurrentGame(
      createResponseFirstUser.body.accessToken,
    );
    await Promise.all([
      questionTestManager(app).addAnswer(
        bodyIncorrect,
        createResponseSecondUser.body.accessToken,
      ),
      questionTestManager(app).addAnswer(
        bodyCorrect,
        createResponseFirstUser.body.accessToken,
      ),
    ]);
    {
      const foundGameAfter3Answers = await questionTestManager(
        app,
      ).requestForMyCurrentGame(createResponseFirstUser.body.accessToken);
      expect(
        foundGameAfter3Answers.body.firstPlayerProgress.answers.length,
      ).toBe(2);
      expect(
        foundGameAfter3Answers.body.secondPlayerProgress.answers.length,
      ).toBe(1);
    }
    await Promise.all([
      questionTestManager(app).addAnswer(
        bodyCorrect,
        createResponseSecondUser.body.accessToken,
      ),
      questionTestManager(app).addAnswer(
        bodyIncorrect,
        createResponseFirstUser.body.accessToken,
      ),
    ]);
    await questionTestManager(app).requestForMyCurrentGame(
      createResponseFirstUser.body.accessToken,
    );
    {
      // first user - 3, second user - 2
      const foundGameAfterAnswers = await questionTestManager(
        app,
      ).requestForMyCurrentGame(createResponseFirstUser.body.accessToken);
      expect(
        foundGameAfterAnswers.body.firstPlayerProgress.answers.length,
      ).toBe(3);
      expect(
        foundGameAfterAnswers.body.secondPlayerProgress.answers.length,
      ).toBe(2);
    }
    await Promise.all([
      questionTestManager(app).addAnswer(
        bodyIncorrect,
        createResponseSecondUser.body.accessToken,
      ),
      questionTestManager(app).addAnswer(
        bodyCorrect,
        createResponseFirstUser.body.accessToken,
      ),
    ]);
    await questionTestManager(app).requestForMyCurrentGame(
      createResponseFirstUser.body.accessToken,
    );
    {
      // first user - 4, second user - 3
      const foundGameAfterAnswers = await questionTestManager(
        app,
      ).requestForMyCurrentGame(createResponseFirstUser.body.accessToken);
      expect(
        foundGameAfterAnswers.body.firstPlayerProgress.answers.length,
      ).toBe(4);
      expect(
        foundGameAfterAnswers.body.secondPlayerProgress.answers.length,
      ).toBe(3);
    }
    await Promise.all([
      questionTestManager(app).addAnswer(
        bodyIncorrect,
        createResponseSecondUser.body.accessToken,
      ),
      questionTestManager(app).addAnswer(
        bodyIncorrect,
        createResponseFirstUser.body.accessToken,
      ),
    ]);

    {
      // first user - 5, second user - 4
      const foundGameAfterAnswers = await questionTestManager(
        app,
      ).requestForMyCurrentGame(createResponseFirstUser.body.accessToken);
      expect(
        foundGameAfterAnswers.body.firstPlayerProgress.answers.length,
      ).toBe(5);
      expect(
        foundGameAfterAnswers.body.secondPlayerProgress.answers.length,
      ).toBe(4);
    }
    await questionTestManager(app).addAnswer(
      bodyCorrect,
      createResponseSecondUser.body.accessToken,
    );
    const findPairById = await questionTestManager(
      app,
    ).getRequestForQuizGameForId(
      myCurrent.body.id,
      createResponseSecondUser.body.accessToken,
    );

    expect(findPairById.body.firstPlayerProgress.answers).toHaveLength(5);
    findPairById.body.firstPlayerProgress.answers.forEach((answer) => {
      expect(answer).toEqual(
        expect.objectContaining({
          questionId: expect.any(String),
          answerStatus: expect.any(String),
          addedAt: expect.any(String),
        }),
      );
    });
    expect(findPairById.body.secondPlayerProgress.answers).toHaveLength(5);
    findPairById.body.secondPlayerProgress.answers.forEach((answer) => {
      expect(answer).toEqual(
        expect.objectContaining({
          questionId: expect.any(String),
          answerStatus: expect.any(String),
          addedAt: expect.any(String),
        }),
      );
    });
    expect(findPairById.body.finishGameDate).toEqual(expect.any(String));
    const getPairByMy = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/my`)
      .set(
        'Authorization',
        `Bearer ${createResponseFirstUser.body.accessToken}`,
      )
      .expect(HTTP_STATUS.OK_200);
    const pair = await questionTestManager(app).getRequestForQuizGameForId(
      findPairById.body.id,
      createResponseFirstUser.body.accessToken,
    );
    expect(getPairByMy.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 1,
      items: expect.arrayContaining([
        expect.objectContaining({
          id: findPairById.body.id,
          firstPlayerProgress: pair.body.firstPlayerProgress,
          secondPlayerProgress: pair.body.secondPlayerProgress,
        }),
      ]),
    });
  });
  it(`--POST create pair, connect two player, 1 player add 5 answers, await 10sec and 2 player should automatically add 5 incorrect answer`, async () => {
    const bodyCorrect = {
      answer: 'correct answer',
    };
    const thirdUserBody = {
      login: 'hleb',
      password: 'string',
      email: 'hleb.lukahonak@gmail.com',
    };
    const fourthUserBody = {
      login: 'hleb4',
      password: 'string',
      email: 'hleb.lukahonak@gmail.com',
    };
    await Promise.all([
      usersTestManager(app).createUserAndLogin(thirdUserBody),
      usersTestManager(app).createUserAndLogin(fourthUserBody),
    ]);
    await request(app.getHttpServer())
      .post(`${RouterPath.quizGame}/connection`)
      .set(
        'Authorization',
        `Bearer ${createResponseFirstUser.body.accessToken}`,
      );
    const connectionSecondPlayer = await request(app.getHttpServer())
      .post(`${RouterPath.quizGame}/connection`)
      .set(
        'Authorization',
        `Bearer ${createResponseSecondUser.body.accessToken}`,
      );
    console.log(connectionSecondPlayer.body, 'connectionSecondPlayer');
    const arrowAnswers = [];
    console.log(createResponseFirstUser.body);
    for (let i = 0; i < 5; i++) {
      const answer = await questionTestManager(app).addAnswer(
        bodyCorrect,
        createResponseFirstUser.body.accessToken,
      );
      arrowAnswers.push(answer);
    }
    console.log(arrowAnswers);
    const findPairWhereFirstPlayerGame = await questionTestManager(
      app,
    ).getRequestForQuizGameForId(
      connectionSecondPlayer.body.id,
      createResponseFirstUser.body.accessToken,
    );
    console.log(
      findPairWhereFirstPlayerGame.body,
      'findPairWhereFirstPlayerGame',
    );
    const answers =
      findPairWhereFirstPlayerGame.body.firstPlayerProgress.answers;
    const lastAnswerFirstPlayerDate =
      new Date(answers[answers.length - 1].addedAt).getTime() + 8000;
    const now1 = new Date();
    console.log(now1, 'now1');
    await new Promise((resolve) => setTimeout(resolve, 12000));
    const now = new Date();
    console.log(now, 'now');
    const getPairByMy = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/my`)
      .set(
        'Authorization',
        `Bearer ${createResponseFirstUser.body.accessToken}`,
      )
      .expect(HTTP_STATUS.OK_200);
    const firstAnswerSecondPlayer =
      getPairByMy.body.items[0].secondPlayerProgress.answers[0];
    const addedAtSecondPlayerDate = new Date(
      firstAnswerSecondPlayer.addedAt,
    ).getTime();
    const finishedGame = await questionTestManager(
      app,
    ).getRequestForQuizGameForId(
      connectionSecondPlayer.body.id,
      createResponseFirstUser.body.accessToken,
    );
    expect(finishedGame.body.firstPlayerProgress.answers.length).toBe(5);
    expect(finishedGame.body.secondPlayerProgress.answers.length).toBe(5);
    console.error(finishedGame.body, 'finishedGame.body');
    console.error(
      finishedGame.body.firstPlayerProgress.answers,
      'finishedGame.body firstPlayerProgress answers',
    );
    console.error(
      finishedGame.body.secondPlayerProgress.answers,
      'finishedGame.body secondPlayerProgress answers',
    );
    expect(addedAtSecondPlayerDate).toBeGreaterThanOrEqual(
      lastAnswerFirstPlayerDate,
    );
    expect(finishedGame.body.status).toBe('Finished');
  });
  it(`--POST create 10 questions, published 5 questions. create pair, connect two player, 1 player add 5 answers, await 10sec and 2 player should automatically add 5 incorrect answer`, async () => {
    //создание 10 вопросов
    for (let i = 0; i <= 10; i++) {
      const bodyToCreateQuestion = {
        body: 'question' + i,
        correctAnswers: ['correct answer'],
      };
      await questionTestManager(app).createQuestions(bodyToCreateQuestion);
    }
    const findQuestion = await request(app.getHttpServer())
      .get(RouterPath.question)
      .auth(login, password)
      .expect(HTTP_STATUS.OK_200);
    expect(findQuestion.body.items[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        body: expect.any(String),
        correctAnswers: ['correct answer'],
        published: false,
        createdAt: expect.any(String),
        updatedAt: null,
      }),
    );
    questions = findQuestion.body.items;
    expect(findQuestion.body.items).toHaveLength(10);
    //публикация 5 вопросов
    const fiveQuestions = questions.slice(0, 5);
    for (let i = 0; i < fiveQuestions.length; i++) {
      const updatedQuestion = await request(app.getHttpServer())
        .put(`${RouterPath.question}/${fiveQuestions[i].id}/publish`)
        .auth(login, password)
        .send({ published: true });
      expect(updatedQuestion.status).toBe(204);
    }
    const findQuestions = await request(app.getHttpServer())
      .get(`${RouterPath.question}`)
      .auth(login, password);
    filterQuestionsByPublish = findQuestions.body.items.filter(
      (questions) => questions.published === true,
    );
    expect(fiveQuestions.length).toBe(5);
    expect(filterQuestionsByPublish.length).toBeGreaterThan(0);
    const allPublished = filterQuestionsByPublish.every(
      (question) =>
        question.published === true && typeof question.updatedAt === 'string',
    );
    expect(allPublished).toBe(true);
    //тело правильного ответа
    const bodyCorrect = {
      answer: 'correct answer',
    };
    // 3-й пользователь
    const thirdUserBody = {
      login: 'hleb',
      password: 'string',
      email: 'hleb.lukahonak@gmail.com',
    };
    //4-й пользователь
    const fourthUserBody = {
      login: 'hleb4',
      password: 'string',
      email: 'hleb.lukahonak@gmail.com',
    };
    await Promise.all([
      usersTestManager(app).createUserAndLogin(thirdUserBody),
      usersTestManager(app).createUserAndLogin(fourthUserBody),
    ]);
    // подключение 1 и 2 пользователя
    await request(app.getHttpServer())
      .post(`${RouterPath.quizGame}/connection`)
      .set(
        'Authorization',
        `Bearer ${createResponseFirstUser.body.accessToken}`,
      );
    const connectionSecondPlayer = await request(app.getHttpServer())
      .post(`${RouterPath.quizGame}/connection`)
      .set(
        'Authorization',
        `Bearer ${createResponseSecondUser.body.accessToken}`,
      );
    console.log(connectionSecondPlayer.body, 'connectionSecondPlayer');
    const arrayAnswers = [];
    // 1 игрок дает 5 правильных ответов
    for (let i = 0; i < 5; i++) {
      const answer = await questionTestManager(app).addAnswer(
        bodyCorrect,
        createResponseFirstUser.body.accessToken,
      );
      arrayAnswers.push(answer);
    }
    console.log(arrayAnswers);
    //получение игры по id
    const findPairWhereFirstPlayerGame = await questionTestManager(
      app,
    ).getRequestForQuizGameForId(
      connectionSecondPlayer.body.id,
      createResponseFirstUser.body.accessToken,
    );
    console.log(
      findPairWhereFirstPlayerGame.body,
      'findPairWhereFirstPlayerGame',
    );
    //ответы 1 пользователя
    const answers =
      findPairWhereFirstPlayerGame.body.firstPlayerProgress.answers;
    //установка времени окончания игры
    const lastAnswerFirstPlayerDate =
      new Date(answers[answers.length - 1].addedAt).getTime() + 8000;
    const now1 = new Date();
    console.log(now1, 'now1');
    //ожидание 12 сек
    await new Promise((resolve) => setTimeout(resolve, 12000));
    const now = new Date();
    console.log(now, 'now');
    const getPairByMy = await request(app.getHttpServer())
      .get(`/pair-game-quiz/pairs/my`)
      .set(
        'Authorization',
        `Bearer ${createResponseFirstUser.body.accessToken}`,
      )
      .expect(HTTP_STATUS.OK_200);
    // время первого ответа 2-го пользователя
    const firstAnswerSecondPlayer =
      getPairByMy.body.items[0].secondPlayerProgress.answers[0];
    const addedAtSecondPlayerDate = new Date(
      firstAnswerSecondPlayer.addedAt,
    ).getTime();
    //конечный вид игры
    const finishedGame = await questionTestManager(
      app,
    ).getRequestForQuizGameForId(
      connectionSecondPlayer.body.id,
      createResponseFirstUser.body.accessToken,
    );
    expect(finishedGame.body.firstPlayerProgress.answers.length).toBe(5);
    expect(finishedGame.body.secondPlayerProgress.answers.length).toBe(5);
    console.error(finishedGame.body, 'finishedGame.body');
    console.error(
      finishedGame.body.firstPlayerProgress.answers,
      'finishedGame.body firstPlayerProgress answers',
    );
    console.error(
      finishedGame.body.secondPlayerProgress.answers,
      'finishedGame.body secondPlayerProgress answers',
    );
    // время первого добавленного ответа 2-го пользователя больше или установленному времени концу игры
    expect(addedAtSecondPlayerDate).toBeGreaterThanOrEqual(
      lastAnswerFirstPlayerDate,
    );
    expect(finishedGame.body.status).toBe('Finished');
  });
});
