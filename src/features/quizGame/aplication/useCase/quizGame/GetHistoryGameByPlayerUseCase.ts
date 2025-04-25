import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../../../infrastrucrue/QuizGame.TypeOrmRepo';
import { NewestPostLike } from '../../../../users/domain/User.type';
import { PaginationQueryType } from '../../../../validate-middleware/query-filter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetHistoryGameByPlayerCommand {
  constructor(
    public userModel: NewestPostLike,
    public query: PaginationQueryType,
  ) {}
}

@CommandHandler(GetHistoryGameByPlayerCommand)
export class GetHistoryGameByPlayerUseCase
  implements ICommandHandler<GetHistoryGameByPlayerCommand>
{
  constructor(protected quizGameRepo: QuizGameTypeOrmRepo) {}

  async execute(command: GetHistoryGameByPlayerCommand) {
    return this.quizGameRepo.getHistoryGameByPlayerRepository(
      command.userModel,
      command.query,
    );
  }
}
