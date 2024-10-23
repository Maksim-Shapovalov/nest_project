import { IsBoolean, IsNotEmpty, Length } from 'class-validator';

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
  updatedAt: string | null;
};

export class requestBodyQuestionToCreate {
  @IsNotEmpty()
  @Length(10, 500)
  body: string;
  @IsNotEmpty()
  correctAnswers: [string];
}

export type questBodyToOutput = {
  id: number;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string | null;
};
export type questBodyToOutput1 = {
  id: number;
  body: string;
};
export class PublishType {
  @IsNotEmpty()
  @IsBoolean()
  published: boolean;
}
// export type publishType = {
//   published: boolean;
// };
