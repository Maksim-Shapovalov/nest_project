import { QuizGameTypeOrmRepo } from '../../../infrastrucrue/QuizGame.TypeOrmRepo';
import { AnswerType } from '../../../domain/type/QuizGame.type';
import { QuizGameEntityNotPlayerInfo } from '../../../domain/QuizGame.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewestPostLike } from '../../../../users/domain/User.type';
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
    return this.quizGameRepo.updateAnswerToPlayerIdInGame(
      command.user.userId,
      command.answer,
    );
  }
}
