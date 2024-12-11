import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizGameEntityNotPlayerInfo } from '../../entity/QuizGame.entity';
import { Repository } from 'typeorm';

import { QuizGameTypeOrmRepo } from '../QuizGame.TypeOrmRepo';
import { Cron } from '@nestjs/schedule';

export class Gives10SecondToEndsGameCommand {
  constructor(public executionTime: string) {}
}
@CommandHandler(Gives10SecondToEndsGameCommand)
export class Gives10SecondToEndsGameCase
  implements ICommandHandler<Gives10SecondToEndsGameCommand>
{
  private scheduledCommands: {
    date: Date;
    pair: QuizGameEntityNotPlayerInfo[];
    command: Gives10SecondToEndsGameCommand;
  }[] = [];

  constructor(
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
    protected quizGameRepo: QuizGameTypeOrmRepo,
  ) {}
  async execute(command: Gives10SecondToEndsGameCommand) {
    // const expirationDate = new Date(command.executionTime);
    // const now = new Date();
    const foundActivePairWith5ResponseOnePlayer =
      await this.quizGameRepo.getActivePairWhereOnePlayerAnsweredAllQuestions();
    if (
      !foundActivePairWith5ResponseOnePlayer ||
      foundActivePairWith5ResponseOnePlayer.length == 0
    ) {
      console.log('No active pairs found');
    }
    if (
      foundActivePairWith5ResponseOnePlayer &&
      foundActivePairWith5ResponseOnePlayer.length > 0
    ) {
      for (let i = 0; i < foundActivePairWith5ResponseOnePlayer.length; i++) {
        const playerWhere5Answers =
          foundActivePairWith5ResponseOnePlayer[i].firstPlayer.answers
            .length === 5
            ? foundActivePairWith5ResponseOnePlayer[i].firstPlayer
            : foundActivePairWith5ResponseOnePlayer[i].secondPlayer;
        console.log(foundActivePairWith5ResponseOnePlayer.length);
        if (playerWhere5Answers.answers.length === 5) {
          const timeTheLastAnswers = playerWhere5Answers.answers.at(-1);
          console.log(timeTheLastAnswers);
          this.scheduleCommand(
            new Date(timeTheLastAnswers.addedAt),
            foundActivePairWith5ResponseOnePlayer,
          );
          // await this.AddNewIncorrectAnswer(
          //   foundActivePairWith5ResponseOnePlayer,
          //   expirationDate,
          // );
        }

        // await this.AddNewIncorrectAnswer(
        //   foundActivePairWith5ResponseOnePlayer,
        //   expirationDate,
        // );
      }
    }
  }
  async AddNewIncorrectAnswer(
    AllPairWhere1PlayerGiveAllAnswers: QuizGameEntityNotPlayerInfo[],
    expirationDate: Date,
  ) {
    const now = new Date();
    if (expirationDate > now) {
      console.log('Command execution time has not arrived yet');
    } else {
      for (const pair of AllPairWhere1PlayerGiveAllAnswers) {
        if (!pair.firstPlayer || !pair.secondPlayer) {
          console.log('One of the players is missing in the pair:');
          continue;
        }
        const playerWhoDoesntHave5Answers =
          pair.firstPlayer.answers.length === 5
            ? pair.secondPlayer
            : pair.firstPlayer;
        const notAnsweredCount = 5 - playerWhoDoesntHave5Answers.answers.length;
        for (let answer = 0; answer < notAnsweredCount; answer++) {
          const updateStatusGameAndAnswers =
            await this.quizGameRepo.updateAnswerToPlayerIdInGame(
              playerWhoDoesntHave5Answers.userId,
              'incorrect',
            );
          if (!updateStatusGameAndAnswers) console.log('Not Found Pair');
        }
      }
      return true;
    }
  }

  scheduleCommand(
    answerDate: Date,
    needingPair: QuizGameEntityNotPlayerInfo[],
  ) {
    const command = new Gives10SecondToEndsGameCommand(
      new Date(answerDate.getTime() + 9300).toISOString(),
    );
    this.scheduledCommands.push({
      date: answerDate,
      pair: needingPair,
      command,
    });
  }

  private async clearDataScheduleCommand() {
    this.scheduledCommands.slice();
  }
  @Cron('* * * * * *')
  async handleCron() {
    const now = new Date();
    if (this.scheduledCommands.length > 0) {
      for (const scheduled of [...this.scheduledCommands]) {
        if (new Date(scheduled.command.executionTime) <= now) {
          const resultToAddIncorrectAnswers = await this.AddNewIncorrectAnswer(
            scheduled.pair,
            new Date(scheduled.command.executionTime),
          );
          if (resultToAddIncorrectAnswers) {
            await this.clearDataScheduleCommand();
          }
        }
      }
    }
  }
}
