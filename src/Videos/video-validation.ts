import { body } from 'express-validator';
import { AvailableResolutionsEnum } from './video-type';

export const ValidationVideo = () => [
  body('title').trim().isString().isLength({ min: 1, max: 40 }).notEmpty(),
  body('author').notEmpty().trim().isString().isLength({ min: 1, max: 20 }),
  body('availableResolutions')
    .isArray()
    .custom((value) => {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (!Object.values(AvailableResolutionsEnum).includes(v)) {
            console.log('v', v);
            throw new Error('');
          }
        });
      }

      return true;
    }),
];
