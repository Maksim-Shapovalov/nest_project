import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizGameEntityNotPlayerInfo } from '../../entity/QuizGame.entity';
import { Repository } from 'typeorm';

import { QuizGameTypeOrmRepo } from '../QuizGame.TypeOrmRepo';
import { Cron } from '@nestjs/schedule';
import { PlayersEntity } from '../../entity/Players.Entity';
import { BaseTypeQuizGame } from '../../type/QuizGame.type';

// export class Gives10SecondToEndsGameCommand {
//   constructor(public executionTime: string) {}
// }
export class Gives10SecondToEndsGameCommand {
  constructor(
    public executionTime: string,
    public gameId: string,
  ) {}
}
@CommandHandler(Gives10SecondToEndsGameCommand)
export class Gives10SecondToEndsGameCase
  implements ICommandHandler<Gives10SecondToEndsGameCommand>
{
  private scheduledCommands1: {
    pair: QuizGameEntityNotPlayerInfo;
    executionTime: Date;
    player: PlayersEntity;
  }[] = [];

  constructor(
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
    protected quizGameRepo: QuizGameTypeOrmRepo,
    @InjectRepository(PlayersEntity)
    protected playersEntity: Repository<PlayersEntity>,
  ) {}
  async execute(command: Gives10SecondToEndsGameCommand) {
    const findPairInDB = await this.quizGameEntityNotPlayerInfo.findOne({
      where: {
        id: command.gameId,
      },
      relations: {
        question: true,
        firstPlayer: { answers: true },
        secondPlayer: { answers: true },
      },
    });
    if (!findPairInDB) return false;
    const playerWhere5Answers =
      findPairInDB.firstPlayer.answers.length === 5
        ? findPairInDB.secondPlayer
        : findPairInDB.firstPlayer;
    this.scheduleCommand1(
      findPairInDB,
      new Date(command.executionTime),
      playerWhere5Answers,
    );
  }
  async AddNewIncorrectAnswer1(
    AllPairWhere1PlayerGiveAllAnswers: QuizGameEntityNotPlayerInfo,
    executionTime: Date,
    player: PlayersEntity,
  ) {
    const foundGame = await this.quizGameRepo.getGameById(
      AllPairWhere1PlayerGiveAllAnswers.id,
    );
    if (!foundGame) return null;
    const playerToFillId = player.id;
    const playerToFill =
      (foundGame as BaseTypeQuizGame).firstPlayer.id === playerToFillId
        ? foundGame.firstPlayer
        : foundGame.secondPlayer;
    if (playerToFill.answers.length === 5) return false;
    const notAnsweredCount = 5 - playerToFill.answers.length;
    for (let answer = 0; answer < notAnsweredCount; answer++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updateStatusGameAndAnswers =
        await this.quizGameRepo.addIncorrectAnswersAfter10sec(
          foundGame,
          player,
        );
      // await this.quizGameRepo.addIncorrectAnswersAfter10sec(
      //     foundGame,
      //     player,
      //   );
      if (!updateStatusGameAndAnswers) console.log('Not Found Pair');
    }
    return true;
  }

  scheduleCommand1(
    needingPair: QuizGameEntityNotPlayerInfo,
    executionTime: Date,
    player: PlayersEntity,
  ) {
    this.scheduledCommands1.push({
      pair: needingPair,
      executionTime: executionTime,
      player: player,
    });
  }

  private clearDataScheduleCommand(index: number) {
    this.scheduledCommands1.splice(index, 1);
  }
  @Cron('* * * * * *')
  async handleCron() {
    const now = new Date();
    if (this.scheduledCommands1.length > 0) {
      for (
        let scheduled = 0;
        scheduled < this.scheduledCommands1.length;
        scheduled++
      ) {
        if (this.scheduledCommands1[scheduled].executionTime <= now) {
          await this.AddNewIncorrectAnswer1(
            this.scheduledCommands1[scheduled].pair,
            this.scheduledCommands1[scheduled].executionTime,
            this.scheduledCommands1[scheduled].player,
          );
          this.clearDataScheduleCommand(scheduled);
        }
      }
    }
  }
}
