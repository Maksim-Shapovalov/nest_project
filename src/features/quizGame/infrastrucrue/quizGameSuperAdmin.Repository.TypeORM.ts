import { Injectable } from '@nestjs/common';
import { PaginationQueryType } from '../../validate-middleware/query-filter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  questBodyToOutput,
  questionBody,
  QuestionType,
  requestBodyQuestionToCreate,
} from '../domain/type/question.type';
import { QuestionsEntity } from '../domain/Questions.Entity';
import { log } from 'console';

@Injectable()
export class QuizGameSuperAdminRepositoryTypeORM {
  constructor(
    @InjectRepository(QuestionsEntity)
    protected quizGameRepository: Repository<QuestionsEntity>,
  ) {}
  async getAllQuestions(filter: PaginationQueryType) {
    const pageSizeInQuery: number = filter.pageSize;
    const totalCount = await this.quizGameRepository.findAndCount();
    const pageCountBlogs: number = Math.ceil(totalCount[1] / pageSizeInQuery);
    const pageBlog: number = (filter.pageNumber - 1) * pageSizeInQuery;

    const result = await this.quizGameRepository.find({
      order: {
        [filter.sortBy]: filter.sortDirection,
      },
      take: pageSizeInQuery,
      skip: pageBlog,
    });
    const items = await Promise.all(result.map((p) => this.questGetMapper(p)));
    console.log('write text');
    return {
      pagesCount: pageCountBlogs,
      page: filter.pageNumber,
      pageSize: pageSizeInQuery,
      totalCount: totalCount[1],
      items: items,
    };
  }
  async createQuestion(createNewQuestion: QuestionType) {
    const newQuestion = await this.quizGameRepository.create({
      body: createNewQuestion.body,
      correctAnswers: createNewQuestion.correctAnswers.flat(),
      published: createNewQuestion.published,
      createdAt: createNewQuestion.createdAt,
    });
    const saveQuestion = await this.quizGameRepository.save(newQuestion);

    return this.questGetMapper(saveQuestion);
  }
  async deleteQuestionById(id: number) {
    const findQuestionInDB = await this.quizGameRepository.find({
      where: { id: id },
    });
    if (findQuestionInDB.length === 0) return false;
    const deleteResult = await this.quizGameRepository.delete(id);
    return deleteResult.affected > 0;
  }
  async updateQuestionAndCorrectAnswerRepo(
    body: requestBodyQuestionToCreate,
    id: number,
  ) {
    const now = new Date().toISOString();
    const findQuestionInDB = await this.quizGameRepository.find({
      where: { id: id },
    });
    if (!findQuestionInDB[0]) return false;
    await this.quizGameRepository.update(id, {
      body: body.body,
      correctAnswers: body.correctAnswers,
      updatedAt: now,
    });
    return true;
  }
  async updateQuestionPublishedRepo(published: boolean, id: number) {
    const now = new Date().toISOString();
    const findQuestionInDB = await this.quizGameRepository.find({
      where: { id: id },
    });
    if (!findQuestionInDB[0]) return false;
    await this.quizGameRepository.update(id, {
      published: published,
      updatedAt: now,
    });
    console.log('write text');
    return true;
  }

  async questGetMapper(quest: questBodyToOutput): Promise<questionBody> {
    return {
      id: quest.id.toString(),
      body: quest.body,
      correctAnswers: quest.correctAnswers,
      published: quest.published,
      createdAt: quest.createdAt,
      updatedAt: quest.updatedAt === 'null' ? null : quest.updatedAt,
    };
  }
}
