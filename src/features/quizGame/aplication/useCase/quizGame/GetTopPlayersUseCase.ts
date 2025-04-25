import { QuizGameTypeOrmRepo } from '../../../infrastrucrue/QuizGame.TypeOrmRepo';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizGameEntityNotPlayerInfo } from '../../../domain/QuizGame.entity';
import { Repository } from 'typeorm';
import { QueryTypeToTopPlayers } from '../../../../validate-middleware/Query.Type';
import { QuizGameService } from '../../QuizGame.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetTopPlayersCommand {
  constructor(public query: QueryTypeToTopPlayers) {}
}

@CommandHandler(GetTopPlayersCommand)
export class GetTopPlayersUseCase
  implements ICommandHandler<GetTopPlayersCommand>
{
  constructor(
    protected quizGameRepo: QuizGameTypeOrmRepo,
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
    protected quizGameService: QuizGameService,
  ) {}

  async execute(command: GetTopPlayersCommand) {
    const findPlayer = await this.quizGameRepo.getTopPlayers();
    const uniqueUserIds = new Set<string>();
    const findAllPairByPlayerId = await Promise.all(
      findPlayer.map(async (player) => {
        if (!uniqueUserIds.has(player.userId)) {
          uniqueUserIds.add(player.userId);

          const staticPlayer = await this.quizGameService.getStatisticPlayer(
            player.userId,
          );

          return {
            ...staticPlayer,
            player: {
              id: player.userId,
              login: player.login,
            },
          };
        }
        return null;
      }),
    );
    const filteredPlayers = findAllPairByPlayerId.filter(
      (player) => player !== null,
    );
    const countPlayer = filteredPlayers.length;
    let querySort = command.query.sortBy;
    const optionsSorted = {};
    if (Array.isArray(command.query.sortBy)) {
      querySort.forEach((param) => {
        const [field, direction] = param.split(' ');
        if (field && direction) {
          optionsSorted[field] = direction as 'asc' | 'desc';
        }
      });
    }
    if (typeof querySort === 'string') {
      querySort = [querySort];
    }
    const sortedItems = filteredPlayers.sort((a, b) => {
      for (const param of querySort) {
        const [field, direction] = param.split(' ');
        const aValue = a[field];
        const bValue = b[field];

        if (aValue > bValue) return direction === 'desc' ? -1 : 1;
        if (aValue < bValue) return direction === 'desc' ? 1 : -1;
      }
      return 0;
    });
    const startIndex = (command.query.pageNumber - 1) * command.query.pageSize;
    const endIndex = startIndex + command.query.pageSize;
    const paginatedItems = sortedItems.slice(startIndex, endIndex);

    return {
      pagesCount: Math.ceil(countPlayer / command.query.pageSize),
      page: command.query.pageNumber,
      pageSize: command.query.pageSize,
      totalCount: countPlayer,
      items: paginatedItems,
    };
  }
}
