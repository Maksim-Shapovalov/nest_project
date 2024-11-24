import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../QuizGame.TypeOrmRepo';
import { NewestPostLike } from '../../../Users/Type/User.type';
import { PaginationQueryType } from '../../../qurey-repo/query-filter';
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
