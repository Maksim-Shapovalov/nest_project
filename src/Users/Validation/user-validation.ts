import { body } from 'express-validator';

export const UserValidation = () => [
  body('login')
    .trim()
    .isLength({ min: 3, max: 10 })
    .isString()
    .notEmpty()
    .matches('^[a-zA-Z0-9_-]*$')
    .withMessage('Invalid login'),
  body('password')
    .trim()
    .isLength({ min: 6, max: 20 })
    .isString()
    .notEmpty()
    .withMessage('Invalid password'),
  body('email')
    .trim()
    .isString()
    .notEmpty()
    .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
    .withMessage('Invalid email'),
];
