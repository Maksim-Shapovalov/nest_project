import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../QuizGame.TypeOrmRepo';
import { AnswerType, updateTypeOfQuestion1 } from '../../type/QuizGame.type';
import { QuizGameEntityNotPlayerInfo } from '../../entity/QuizGame.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewestPostLike } from '../../../Users/Type/User.type';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class SendAnswerCommand {
  constructor(
    public answer: string,
    public user: NewestPostLike,
  ) {}
}
@CommandHandler(SendAnswerCommand)
export class SendAnswerUseCase implements ICommandHandler<SendAnswerCommand> {
  constructor(
    protected quizGameRepo: QuizGameTypeOrmRepo,
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
  ) {}

  async execute(command: SendAnswerCommand): Promise<AnswerType | false> {
    const findPlayerInGame: updateTypeOfQuestion1 | false =
      await this.quizGameRepo.updateAnswerToPlayerIdInGame(
        command.user.userId,
        command.answer,
      );
    return findPlayerInGame ? findPlayerInGame : false;
  }
}
