import { Injectable } from '@nestjs/common';
import { QuizGameSuperAdminRepository } from './quizGameSuperAdmin.Repository';
import { PaginationQueryType } from '../../qurey-repo/query-filter';
import {
  QuestionType,
  requestBodyQuestionToCreate,
} from '../type/question.type';

@Injectable()
export class QuizGameSuperAdminService {
  constructor(
    protected quizGameSuperAdminRepository: QuizGameSuperAdminRepository,
  ) {}
  async getAllQuestions(filter: PaginationQueryType) {
    return this.quizGameSuperAdminRepository.getAllQuestions(filter);
  }
  async createQuestion(question: requestBodyQuestionToCreate) {
    const now = new Date();
    const createNewQuestion = new QuestionType(
      question.body,
      [question.correctAnswers],
      false,
      now.toISOString(),
      null,
    );

    const takeAllQuestions =
      await this.quizGameSuperAdminRepository.createQuestion(createNewQuestion);
    return takeAllQuestions;
  }
  async deleteQuestionById(id: number) {
    return this.quizGameSuperAdminRepository.deleteQuestionById(id);
  }

  async updateQuestionBodyAndCorrectAnswer(
    body: requestBodyQuestionToCreate,
    id: number,
  ) {
    return this.quizGameSuperAdminRepository.updateQuestionAndCorrectAnswerRepo(
      body,
      id,
    );
  }
  async updateQuestionPublished(published: boolean, id: number) {
    return this.quizGameSuperAdminRepository.updateQuestionPublishedRepo(
      published,
      id,
    );
  }
}
