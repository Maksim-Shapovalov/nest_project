import { IsEnum, IsNotEmpty, Length } from 'class-validator';
import { Trim } from '../../Other/trim-validator';

export class QuestionType {
  constructor(
    public body: string,
    public correctAnswers: string[],
    public published: boolean,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
export type questionBody = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: string;
  createdAt: string;
  updatedAt: string;
};
export enum trueAnswer {
  Six = '6',
  SixWords = 'six',
  SixInRussian = 'шесть',
  ALot = 'дофига',
}

export class requestBodyQuestionToCreate {
  @Trim()
  @IsNotEmpty()
  @Length(10, 500)
  body: string;
  @Trim()
  @IsNotEmpty()
  @IsEnum(trueAnswer, { each: true })
  correctAnswers: trueAnswer;
}
