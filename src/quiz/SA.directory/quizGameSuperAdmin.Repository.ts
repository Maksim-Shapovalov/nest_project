import { Injectable } from '@nestjs/common';
import { PaginationQueryType } from '../../qurey-repo/query-filter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  questBodyToOutput,
  questionBody,
  QuestionType,
  requestBodyQuestionToCreate,
} from '../type/question.type';
import { QuizGameService } from '../QuizGame.service';
import { AnswerType, updateTypeOfQuestion } from '../type/QuizGame.type';

@Injectable()
export class QuizGameSuperAdminRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected quizGameService: QuizGameService,
  ) {}
  async getAllQuestions(filter: PaginationQueryType) {
    const pageSizeInQuery: number = filter.pageSize;
    const totalCountPosts = await this.dataSource.query(
      `SELECT COUNT(*) FROM "questions_entity"`,
    );
    const totalCount = parseInt(totalCountPosts[0].count);
    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.dataSource.query(
      `SELECT * FROM "questions_entity" 
      ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT 
      ${pageSizeInQuery} OFFSET ${pageBlog}`,
    );
    // const items = await Promise.all(result[0]);
    const items = await Promise.all(result.map((p) => this.questGetMapper(p)));
    console.log(items);
    // const items = result;
    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCount,
      items: items,
    };
  }
  async createQuestion(createNewQuestion: QuestionType) {
    const generateRandomId = Math.floor(Math.random() * 1000000);
    const newQuestion = `INSERT INTO public."questions_entity"(
      id, body, "correctAnswers", published, "createdAt", "updatedAt" )
    VALUES (${generateRandomId.toString()}, '${createNewQuestion.body}', ARRAY['${createNewQuestion.correctAnswers}'],
     '${createNewQuestion.published}', '${createNewQuestion.createdAt}','${createNewQuestion.updatedAt}')
    RETURNING *`;
    const result = await this.dataSource.query(newQuestion);
    return this.questGetMapper(result[0]);
  }
  async deleteQuestionById(id: number) {
    const findQuestionInDB = await this.dataSource.query(
      `SELECT * FROM "questions_entity" WHERE id = ${id}`,
    );
    if (!findQuestionInDB[0]) return false;
    const findPost = await this.dataSource.query(
      `DELETE FROM public."questions_entity" WHERE "id" = ${id} ;`,
    );
    if (findPost[1] > 0) return true;
  }
  async updateQuestionAndCorrectAnswerRepo(
    body: requestBodyQuestionToCreate,
    id: number,
  ) {
    const now = new Date().toISOString();
    const findQuestionInDB = await this.dataSource.query(
      `SELECT * FROM "questions_entity" WHERE id = ${id}`,
    );
    if (!findQuestionInDB[0]) return false;
    await this.dataSource.query(
      `UPDATE "questions_entity" SET "body" = '${body.body}',
 "correctAnswers" = ARRAY['${body.correctAnswers}', "updatedAt = '${now}'"]
            WHERE "id" = ${id}
            RETURNING *`,
    );
    return true;
  }
  async updateQuestionPublishedRepo(published: boolean, id: number) {
    const findQuestionInDB = await this.dataSource.query(
      `SELECT * FROM "questions_entity" WHERE id = ${id}`,
    );
    if (!findQuestionInDB[0]) return false;
    await this.dataSource.query(
      `UPDATE "questions_entity" SET "published" = ${published}
            WHERE "id" = ${id}
            RETURNING *`,
    );
    return true;
  }

  async questGetMapper(quest: questBodyToOutput): Promise<questionBody> {
    // if (quest.updatedAt === 'null') {
    //   return {
    //     id: quest.id.toString(),
    //     body: quest.body,
    //     correctAnswers: quest.correctAnswers,
    //     published: quest.published,
    //     createdAt: quest.createdAt,
    //     updatedAt: null,
    //   };
    // }
    return {
      id: quest.id.toString(),
      body: quest.body,
      correctAnswers: quest.correctAnswers,
      published: quest.published,
      createdAt: quest.createdAt,
      updatedAt: 'null' ? null : quest.updatedAt,
    };
  }
}
