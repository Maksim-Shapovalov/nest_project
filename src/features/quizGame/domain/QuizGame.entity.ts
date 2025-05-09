import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayersEntity } from './Players.Entity';
import { QuestionsEntity } from './Questions.Entity';
import { ViewModelPairToOutput, BaseTypeQuizGame } from './type/QuizGame.type';

enum StatusTypeEnum {
  Active = 'Active',
  Finished = 'Finished',
  PendingSecondPlayer = 'PendingSecondPlayer',
}
@Entity()
export class QuizGameEntityNotPlayerInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => PlayersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'firstPlayer' })
  firstPlayer: PlayersEntity;

  @Column()
  firstPlayerId: string;

  @ManyToOne(() => PlayersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'secondPlayer' })
  secondPlayer: PlayersEntity | null;

  @Column({ default: null })
  secondPlayerId: string | null;
  @Column()
  status: StatusTypeEnum;
  @Column()
  pairCreatedDate: string;
  @Column({ default: null })
  startGameDate: string | null;
  @Column({ default: null })
  finishGameDate: string | null;
  @ManyToMany(() => QuestionsEntity, (question) => question.quizGames)
  @JoinTable({ name: 'quiz_game_questions' })
  question: QuestionsEntity[] | null;

  static getViewModel(
    game: BaseTypeQuizGame,
    player1: PlayersEntity,
    player2: PlayersEntity | null,
  ): ViewModelPairToOutput {
    let questions = [];
    if (game && game.question === null) {
      questions = [];
    } else if (game && game.question.length > 0) {
      questions = game.question
        .map((q) => ({
          id: q.id.toString(),
          body: q.body,
        }))
        .sort((a, b) => a.id - b.id);
    }

    const answer = player1.answers
      .map((m) => ({
        addedAt: m.addedAt,
        answerStatus: m.answerStatus,
        questionId: m.questionId.toString(),
      }))
      .sort(
        (a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
      );
    let answer1 = [];
    if (player2) {
      answer1 = player2.answers
        .map((m) => ({
          addedAt: m.addedAt,
          answerStatus: m.answerStatus,
          questionId: m.questionId.toString(),
        }))
        .sort(
          (a, b) =>
            new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime(),
        );
    }

    return {
      id: game.id.toString(),
      firstPlayerProgress: {
        answers: answer,
        player: {
          id: player1.userId.toString(),
          login: player1.login,
        },
        score: player1.score,
      },
      secondPlayerProgress:
        player2 !== null
          ? {
              answers: answer1,
              player: {
                id: player2.userId,
                login: player2.login,
              },
              score: player2.score,
            }
          : null,
      questions: player2 !== null ? questions : null,
      status:
        game.status !== null ? game.status : StatusTypeEnum.PendingSecondPlayer,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
@Entity()
export class AnswersEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => QuestionsEntity)
  question: QuestionsEntity;
  @Column()
  questionId: number;
  @ManyToOne(() => PlayersEntity, (player) => player.answers, {
    onDelete: 'CASCADE',
  })
  player: PlayersEntity;
  @Column()
  playerId: string;
  @Column()
  answerStatus: StatusTypeEnumByAnswersToEndpoint;
  @Column()
  answer: string;
  @Column()
  addedAt: string;
}

export enum StatusTypeEnumByAnswersToEndpoint {
  correct = 'Correct',
  incorrect = 'Incorrect',
}
