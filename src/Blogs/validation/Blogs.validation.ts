import { body } from 'express-validator';

export const BlogsValidation = () => [
  body('name')
    .trim()
    .isString()
    .isLength({ min: 1, max: 15 })
    .notEmpty()
    .withMessage('Invalid name'),
  body('description')
    .trim()
    .isString()
    .isLength({ min: 1, max: 500 })
    .notEmpty()
    .withMessage('Invalid description'),
  body('websiteUrl')
    .trim()
    .isString()
    .isLength({ min: 1, max: 100 })
    .matches('^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$')
    .withMessage('Invalid websiteUrl'),
];
