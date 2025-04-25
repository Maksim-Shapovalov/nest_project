import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PlayersEntity } from '../quizGame/domain/Players.Entity';
import { QuestionsEntity } from '../quizGame/domain/Questions.Entity';
import {
  AnswersEntity,
  QuizGameEntityNotPlayerInfo,
} from '../quizGame/domain/QuizGame.entity';

@Injectable()
export class AllDataClearRepo {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(QuizGameEntityNotPlayerInfo)
    protected quizGameEntityNotPlayerInfo: Repository<QuizGameEntityNotPlayerInfo>,
    @InjectRepository(PlayersEntity)
    protected playersEntity: Repository<PlayersEntity>,
    @InjectRepository(QuestionsEntity)
    protected questionsEntity: Repository<QuestionsEntity>,
    @InjectRepository(AnswersEntity)
    protected answersEntity: Repository<AnswersEntity>,
  ) {}

  async dataClear() {
    await Promise.all([
      await this.dataSource.query(
        `
       DELETE FROM public."answers_entity";
      DELETE FROM public."quiz_game_entity_not_player_info";
      DELETE FROM public."questions_entity";
      DELETE FROM public."players_entity";
      
      
      DELETE FROM public."posts_like_entity"; 
      DELETE FROM public."comment_entity"; 
      DELETE FROM public."comment_like_entity"; 
      DELETE FROM public."blogs_entity"; 
      DELETE FROM public."posts_entity"; 
      DELETE FROM public."device_entity"; 
      DELETE FROM public."user_entity";`,
      ),
    ]);
    return true;
  }
}
//       DELETE FROM public."answers_entity";
//       DELETE FROM public."quiz_game_entity_not_player_info";
//       DELETE FROM public."questions_entity";
//       DELETE FROM public."players_entity";
