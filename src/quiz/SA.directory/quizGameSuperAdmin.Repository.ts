import { Injectable } from '@nestjs/common';
import { PaginationQueryType } from '../../qurey-repo/query-filter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  QuestionType,
  requestBodyQuestionToCreate,
} from '../type/question.type';

@Injectable()
export class QuizGameSuperAdminRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getAllQuestions(filter: PaginationQueryType) {
    const pageSizeInQuery: number = filter.pageSize;
    const totalCountPosts = await this.dataSource.query(
      `SELECT COUNT(*) FROM "question_entity"`,
    );

    const totalCount = parseInt(totalCountPosts[0].count);
    const pageCountBlogs: number = Math.ceil(totalCount / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.dataSource.query(
      `SELECT * FROM "question_entity" 
      ORDER BY "${filter.sortBy}" ${filter.sortDirection} LIMIT 
      ${pageSizeInQuery} OFFSET ${pageBlog}`,
    );
    const items = await Promise.all(result[0]);
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
    const newQuestion = `INSERT INTO public."question_entity"(
      id, body, correctAnswers, published, createdAt, updatedAt, )
    VALUES (${generateRandomId.toString()}, '${createNewQuestion.body}', '${createNewQuestion.correctAnswers}',
     '${createNewQuestion.published}', '${createNewQuestion.updatedAt}', '${createNewQuestion.createdAt}')
    RETURNING *`;
    const result = await this.dataSource.query(newQuestion);
    return result[0];
  }
  async deleteQuestionById(id: number) {
    const findQuestionInDB = await this.dataSource.query(
      `SELECT * FROM "question_entity" WHERE id = ${id}`,
    );
    if (!findQuestionInDB[0]) return false;
    const findPost = await this.dataSource.query(
      `DELETE FROM public."question_entity" WHERE "id" = ${id} ;`,
    );
    if (findPost[1] > 0) return true;
  }
  async updateQuestionAndCorrectAnswerRepo(
    body: requestBodyQuestionToCreate,
    id: number,
  ) {
    const findQuestionInDB = await this.dataSource.query(
      `SELECT * FROM "question_entity" WHERE id = ${id}`,
    );
    if (!findQuestionInDB[0]) return false;
    await this.dataSource.query(
      `UPDATE "question_entity" SET "body" = ${body.body}, "correctAnswers" = ${body.correctAnswers}
            WHERE "id" = ${id}
            RETURNING *`,
    );
    return true;
  }
  async updateQuestionPublishedRepo(published: boolean, id: number) {
    const findQuestionInDB = await this.dataSource.query(
      `SELECT * FROM "question_entity" WHERE id = ${id}`,
    );
    if (!findQuestionInDB[0]) return false;
    await this.dataSource.query(
      `UPDATE "question_entity" SET "published" = ${published}
            WHERE "id" = ${id}
            RETURNING *`,
    );
    return true;
  }
}
