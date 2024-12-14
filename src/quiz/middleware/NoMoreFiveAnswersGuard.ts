import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../quizeGame/QuizGame.TypeOrmRepo';

@Injectable()
export class NoMoreFiveAnswersGuard implements CanActivate {
  constructor(protected quizGameRepo: QuizGameTypeOrmRepo) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userModel = request.user.userId;
    const playerWithUserId =
      await this.quizGameRepo.findPlayerByUserId(userModel);
    if (!playerWithUserId) throw new ForbiddenException();
    if (playerWithUserId.answers.length === 5) {
      throw new ForbiddenException();
    }
    return true;
  }
}
