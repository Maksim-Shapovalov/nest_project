import { Injectable } from '@nestjs/common';
import { QuizGameTypeOrmRepo } from '../QuizGame.TypeOrmRepo';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizGameEntityNotPlayerInfo } from '../../entity/QuizGame.entity';
import { Repository } from 'typeorm';
import { QueryTypeToTopPlayers } from '../../../Other/Query.Type';
import { QuizGameService } from '../QuizGame.service';
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
    const countPlayer = findPlayer.length;
    const uniqueUserIds = new Set<string>();
    const findAllPairByPlayerId = await Promise.all(
      findPlayer.map(async (player) => {
        if (!uniqueUserIds.has(player.userId)) {
          uniqueUserIds.add(player.userId); // Добавляем userId в Set

          const staticPlayer = await this.quizGameService.getStatisticPlayer(
            player.userId,
          );

          return {
            ...staticPlayer,
            players: {
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
    const querySort = command.query.sortBy;
    const optionsSorted = {};
    querySort.forEach((param) => {
      const [field, direction] = param.split(' ');
      if (field && direction) {
        optionsSorted[field] = direction as 'asc' | 'desc';
      }
    });
    const sortedItems = filteredPlayers.sort((a, b) => {
      for (const param of querySort) {
        const [field, direction] = param.split(' ');
        const aValue = a[field];
        const bValue = b[field];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (aValue < bValue) {
            return direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return direction === 'asc' ? 1 : -1;
          }
        } else {
          // Предполагаем, что это числа
          const aNum = parseFloat(aValue);
          const bNum = parseFloat(bValue);
          if (aNum < bNum) {
            return direction === 'asc' ? -1 : 1;
          }
          if (aNum > bNum) {
            return direction === 'asc' ? 1 : -1;
          }
        }
      }
      return 0; // Если все поля равны
    });
    return {
      pagesCount: Math.ceil(countPlayer / command.query.pageSize),
      page: command.query.pageNumber,
      pageSize: command.query.pageSize,
      totalCount: countPlayer,
      items: sortedItems,
    };
  }
}
