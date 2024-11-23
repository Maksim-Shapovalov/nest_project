import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../QuizGame.TypeOrmRepo';
import { NewestPostLike } from '../../../Users/Type/User.type';
import { PaginationQueryType } from '../../../qurey-repo/query-filter';

export class GetHistoryGameByPlayerCommand {
  constructor(
    public userModel: NewestPostLike,
    public query: PaginationQueryType,
  ) {}
}

@Injectable()
export class GetHistoryGameByPlayerUseCase {
  constructor(protected quizGameRepo: QuizGameTypeOrmRepo) {}

  async execute(userModel: NewestPostLike, query: PaginationQueryType) {
    return this.quizGameRepo.getHistoryGameByPlayerRepository(userModel, query);
  }
}
