import { ValidationError, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../Index';

const ErrorsFormatter = (e: ValidationError) => {
  return {
    message: e.msg,
    // @ts-expect-error
    field: e.path,
  };
};

export const ErrorMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = validationResult(req).formatWith(ErrorsFormatter);

  if (!result.isEmpty()) {
    const errorsMessage = {
      errorsMessages: result.array({ onlyFirstError: true }),
    };
    console.log(errorsMessage);
    return res.status(HTTP_STATUS.BAD_REQUEST_400).send(errorsMessage);
  }

  next();
};
