import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../quizeGame/QuizGame.TypeOrmRepo';
import { CustomUUIDValidation } from '../../Other/validator.validateUUID';

@Injectable()
export class GameUserGuard implements CanActivate {
  constructor(
    protected quizGameRepo: QuizGameTypeOrmRepo,
    private readonly customUUIDValidation: CustomUUIDValidation,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userModel = request.user.userId;
    const gameId = request.params.id;
    if (!gameId || !this.customUUIDValidation.validate(gameId))
      throw new BadRequestException();

    const isUserInGame = await this.quizGameRepo.getGameById(gameId);
    if (!isUserInGame) {
      throw new NotFoundException();
    } else if (
      isUserInGame.firstPlayer.userId !== userModel &&
      isUserInGame.secondPlayer.userId !== userModel
    ) {
      throw new ForbiddenException();
    }
    return true;
  }
}
