import { IsNotEmpty, Length } from 'class-validator';

export class QuestionType {
  constructor(
    public body: string,
    public correctAnswers: string[],
    public published: boolean,
    public createdAt: string,
    public updatedAt: string | null,
  ) {}
}
export type questionBody = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export class requestBodyQuestionToCreate {
  @IsNotEmpty()
  @Length(10, 500)
  body: string;
  @IsNotEmpty()
  correctAnswers: string;
}

export type questBodyToOutput = {
  id: number;
  body: string;
  correctAnswers: [string];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
