import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AllDataClearRepo {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async dataClear() {
    await Promise.all([
      this.dataSource.query(
        `DELETE FROM public."device_entity"; 
        DELETE FROM public."comment_like_entity"; 
        DELETE FROM public."comment_entity"; 
        DELETE FROM public."posts_like_entity"; 
         DELETE FROM public."posts_entity"; 
         DELETE FROM public."blogs_entity";
          DELETE FROM public."user_entity";`,
      ),
    ]);
    return true;
  }
}
