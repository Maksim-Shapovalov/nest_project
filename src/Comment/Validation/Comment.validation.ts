import { body } from 'express-validator';
import { AvailableStatusEnum } from '../Type/Comment.type';

export const CommentValidation = () => [
  body('content')
    .trim()
    .isString()
    .isLength({ min: 20, max: 300 })
    .notEmpty()
    .withMessage('Invalid content'),
];
export const LikeStatusValidation = () => [
  body('likeStatus')
    .trim()
    .isString()
    .isIn(Object.values(AvailableStatusEnum))
    .notEmpty()
    .withMessage('Invalid likeStatus'),
];
