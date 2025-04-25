import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { StatusTypeEnum } from '../../features/quizGame/domain/type/QuizGame.type';
import { QuizGameTypeOrmRepo } from '../../features/quizGame/infrastrucrue/QuizGame.TypeOrmRepo';

@Injectable()
export class NoMoreFiveAnswersGuard implements CanActivate {
  constructor(protected quizGameRepo: QuizGameTypeOrmRepo) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userModel = request.user.userId;
    const playerWithUserId =
      await this.quizGameRepo.findPlayerByUserId(userModel);
    if (!playerWithUserId) throw new ForbiddenException();
    const findPairWherePlayerGame = await this.quizGameRepo.getGameById(
      playerWithUserId.game.id,
    );
    if (
      findPairWherePlayerGame &&
      findPairWherePlayerGame.status === StatusTypeEnum.PendingSecondPlayer
    )
      throw new ForbiddenException();
    if (playerWithUserId.answers.length === 5) {
      throw new ForbiddenException();
    }
    return true;
  }
}
