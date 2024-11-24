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
    console.log(querySort, 'querySort-------');
    // const [field, direction] = querySort.split(' ');
    const sortedItems = filteredPlayers.sort((a, b) => {
      for (const param of querySort) {
        const [field, direction] = param.split(' ');
        console.log(field, direction, 'field, direction---------------');

        const aValue = a[field];
        const bValue = b[field];
        console.log(aValue, bValue, 'value-----------');

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // const sortedItems_1 = filteredPlayers.sort((a, b) => {
    //   for (const param of querySort) {
    //     const [field, direction] = param.split(' ');
    //     const aValue = a[field];
    //     const bValue = b[field];
    //
    //     // Преобразуем значения в числа, если это возможно
    //     const aNum = typeof aValue === 'number' ? aValue : parseFloat(aValue);
    //     const bNum = typeof bValue === 'number' ? bValue : parseFloat(bValue);
    //
    //     if (aNum < bNum) {
    //       return direction === 'desk' ? -1 : 1;
    //     }
    //     if (aNum > bNum) {
    //       return direction === 'desk' ? 1 : -1;
    //     }
    //   }
    //   return 0; // Все поля равны
    // });
    return {
      pagesCount: Math.ceil(countPlayer / command.query.pageSize),
      page: command.query.pageNumber,
      pageSize: command.query.pageSize,
      totalCount: countPlayer,
      items: sortedItems,
    };
  }
}
