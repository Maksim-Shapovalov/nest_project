import { Injectable } from '@nestjs/common';
import { PaginationQueryType } from '../../validate-middleware/query-filter';
import {
  QuestionType,
  requestBodyQuestionToCreate,
} from '../domain/type/question.type';
import { QuizGameSuperAdminRepositoryTypeORM } from '../infrastrucrue/quizGameSuperAdmin.Repository.TypeORM';

@Injectable()
export class QuizGameSuperAdminService {
  constructor(
    protected quizGameSuperAdminRepository: QuizGameSuperAdminRepositoryTypeORM,
  ) {}
  async getAllQuestions(filter: PaginationQueryType) {
    return this.quizGameSuperAdminRepository.getAllQuestions(filter);
  }
  async createQuestion(question: requestBodyQuestionToCreate) {
    const now = new Date();
    console.log('this is');
    console.log('this is');
    console.log('this is');
    const createNewQuestion = new QuestionType(
      question.body,
      question.correctAnswers,
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
