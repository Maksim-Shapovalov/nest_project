import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './Users/User.controller';
import { UserRepository } from './Users/User.repository';
import { UserService } from './Users/User.service';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'process';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URL || 'mongodb://localhost:27017',
    ),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, UserRepository, UserService],
})
export class AppModule {}
