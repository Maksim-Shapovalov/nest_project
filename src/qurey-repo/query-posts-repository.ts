import { body } from 'express-validator';

export const PostspParamsValidation = () => [
  body('title')
    .trim()
    .isString()
    .isLength({ min: 1, max: 30 })
    .notEmpty()
    .withMessage('Invalid title'),
  body('shortDescription')
    .trim()
    .isString()
    .isLength({ min: 1, max: 100 })
    .notEmpty()
    .withMessage('Invalid shortDescription'),
  body('content')
    .trim()
    .isString()
    .isLength({ min: 1, max: 1000 })
    .notEmpty()
    .withMessage('Invalid content'),
];
