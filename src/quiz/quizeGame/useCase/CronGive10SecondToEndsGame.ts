import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizGameEntityNotPlayerInfo } from '../../entity/QuizGame.entity';
import { Repository } from 'typeorm';

import { QuizGameTypeOrmRepo } from '../QuizGame.TypeOrmRepo';
import { Cron } from '@nestjs/schedule';
import { ViewModelPairToOutput } from '../../type/QuizGame.type';

export class Gives10SecondToEndsGameCommand {
  constructor(public executionTime: string) {}
}
export class Gives10SecondToEndsGameCommand1 {
  constructor(
    public executionTime: string,
    public gameId: string,
  ) {}
}
@CommandHandler(Gives10SecondToEndsGameCommand1)
export class Gives10SecondToEndsGameCase
  implements ICommandHandler<Gives10SecondToEndsGameCommand1>
{
  // private scheduledCommands: {
  //   date: Date;
  //   pair: QuizGameEntityNotPlayerInfo[];
  //   command: Gives10SecondToEndsGameCommand;
  // }[] = [];
  private scheduledCommands1: {
    date: Date;
    pair: QuizGameEntityNotPlayerInfo;
    command: Date;
  }[] = [];

  constructor(
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
    protected quizGameRepo: QuizGameTypeOrmRepo,
  ) {}
  async execute(command: Gives10SecondToEndsGameCommand1) {
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
        ? findPairInDB.firstPlayer
        : findPairInDB.secondPlayer;
    const timeTheLastAnswers = playerWhere5Answers.answers.at(-1);
    this.scheduleCommand1(
      new Date(timeTheLastAnswers.addedAt),
      findPairInDB,
      new Date(command.executionTime),
    );
  }
  // async execute1(command: Gives10SecondToEndsGameCommand) {
  //   // const expirationDate = new Date(command.executionTime);
  //   // const now = new Date();
  //   const foundActivePairWith5ResponseOnePlayer =
  //     await this.quizGameRepo.getActivePairWhereOnePlayerAnsweredAllQuestions();
  //   if (
  //     !foundActivePairWith5ResponseOnePlayer ||
  //     foundActivePairWith5ResponseOnePlayer.length == 0
  //   ) {
  //     console.log('No active pairs found');
  //   }
  //   if (
  //     foundActivePairWith5ResponseOnePlayer &&
  //     foundActivePairWith5ResponseOnePlayer.length > 0
  //   ) {
  //     for (let i = 0; i < foundActivePairWith5ResponseOnePlayer.length; i++) {
  //       const playerWhere5Answers =
  //         foundActivePairWith5ResponseOnePlayer[i].firstPlayer.answers
  //           .length === 5
  //           ? foundActivePairWith5ResponseOnePlayer[i].firstPlayer
  //           : foundActivePairWith5ResponseOnePlayer[i].secondPlayer;
  //       console.log(foundActivePairWith5ResponseOnePlayer.length);
  //       if (playerWhere5Answers.answers.length === 5) {
  //         const timeTheLastAnswers = playerWhere5Answers.answers.at(-1);
  //         console.log(timeTheLastAnswers);
  //         this.scheduleCommand(
  //           new Date(timeTheLastAnswers.addedAt),
  //           foundActivePairWith5ResponseOnePlayer,
  //         );
  //         // await this.AddNewIncorrectAnswer(
  //         //   foundActivePairWith5ResponseOnePlayer,
  //         //   expirationDate,
  //         // );
  //       }
  //
  //       // await this.AddNewIncorrectAnswer(
  //       //   foundActivePairWith5ResponseOnePlayer,
  //       //   expirationDate,
  //       // );
  //     }
  //   }
  // }
  // async AddNewIncorrectAnswer(
  //   AllPairWhere1PlayerGiveAllAnswers: QuizGameEntityNotPlayerInfo[],
  //   expirationDate: Date,
  // ) {
  //   const now = new Date();
  //   if (expirationDate > now) {
  //     console.log('Command execution time has not arrived yet');
  //   } else {
  //     for (const pair of AllPairWhere1PlayerGiveAllAnswers) {
  //       if (!pair.firstPlayer || !pair.secondPlayer) {
  //         console.log('One of the players is missing in the pair:');
  //         continue;
  //       }
  //       const playerWhoDoesntHave5Answers =
  //         pair.firstPlayer.answers.length === 5
  //           ? pair.secondPlayer
  //           : pair.firstPlayer;
  //       const notAnsweredCount = 5 - playerWhoDoesntHave5Answers.answers.length;
  //       for (let answer = 0; answer < notAnsweredCount; answer++) {
  //         const updateStatusGameAndAnswers =
  //           await this.quizGameRepo.updateAnswerToPlayerIdInGame(
  //             playerWhoDoesntHave5Answers.userId,
  //             'incorrect',
  //           );
  //         if (!updateStatusGameAndAnswers) console.log('Not Found Pair');
  //       }
  //     }
  //     return true;
  //   }
  // }
  async AddNewIncorrectAnswer1(
    AllPairWhere1PlayerGiveAllAnswers: QuizGameEntityNotPlayerInfo,
    expirationDate: Date,
  ) {
    const now = new Date();
    if (expirationDate > now) {
      console.log('Command execution time has not arrived yet');
    } else {
      const playerWhoDoesntHave5Answers =
        AllPairWhere1PlayerGiveAllAnswers.firstPlayer.answers.length === 5
          ? AllPairWhere1PlayerGiveAllAnswers.secondPlayer
          : AllPairWhere1PlayerGiveAllAnswers.firstPlayer;
      const notAnsweredCount = 5 - playerWhoDoesntHave5Answers.answers.length;
      for (let answer = 0; answer < notAnsweredCount; answer++) {
        const updateStatusGameAndAnswers =
          await this.quizGameRepo.updateAnswerToPlayerIdInGame(
            playerWhoDoesntHave5Answers.userId,
            'incorrect',
          );
        if (!updateStatusGameAndAnswers) console.log('Not Found Pair');
      }

      return true;
    }
  }

  // scheduleCommand(
  //   answerDate: Date,
  //   needingPair: QuizGameEntityNotPlayerInfo[],
  // ) {
  //   const command = new Gives10SecondToEndsGameCommand(
  //     new Date(answerDate.getTime() + 9000).toISOString(),
  //   );
  //   this.scheduledCommands.push({
  //     date: answerDate,
  //     pair: needingPair,
  //     command,
  //   });
  // }
  scheduleCommand1(
    answerDate: Date,
    needingPair: QuizGameEntityNotPlayerInfo,
    executionTime: Date,
  ) {
    this.scheduledCommands1.push({
      date: answerDate,
      pair: needingPair,
      command: executionTime,
    });
  }

  private async clearDataScheduleCommand() {
    this.scheduledCommands1.slice();
  }
  // @Cron('* * * * * *')
  // async handleCron() {
  //   const now = new Date();
  //   if (this.scheduledCommands1.length > 0) {
  //     for (const scheduled of [...this.scheduledCommands1]) {
  //       if (new Date(scheduled.command) <= now) {
  //         const resultToAddIncorrectAnswers = await this.AddNewIncorrectAnswer1(
  //           scheduled.pair,
  //           new Date(scheduled.command),
  //         );
  //         if (resultToAddIncorrectAnswers) {
  //           await this.clearDataScheduleCommand();
  //         }
  //       }
  //     }
  //   }
  // }
  @Cron('* * * * * *')
  async handleCron() {
    const now = new Date();
    if (this.scheduledCommands1.length > 0) {
      for (
        let scheduled = 0;
        scheduled < this.scheduledCommands1.length;
        scheduled++
      ) {
        if (new Date(this.scheduledCommands1[scheduled].command) <= now) {
          const resultToAddIncorrectAnswers = await this.AddNewIncorrectAnswer1(
            this.scheduledCommands1[scheduled].pair,
            new Date(this.scheduledCommands1[scheduled].command),
          );
          if (resultToAddIncorrectAnswers) {
            await this.clearDataScheduleCommand();
          }
        }
      }
    }
  }
}
