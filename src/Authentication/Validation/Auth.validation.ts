import { body } from 'express-validator';
import { UserRepository } from '../../Users/User.repository';

const userRepository = new UserRepository();

export const AuthValidation = () => [
  body('login')
    .custom(async (i) => {
      const findUser = await userRepository.findByLoginOrEmail(i);
      if (findUser) {
        throw new Error('Invalid login');
      }
      return true;
    })
    .trim()
    .isString()
    .isLength({ min: 3, max: 10 })
    .matches('^[a-zA-Z0-9_-]*$')
    .notEmpty()
    .withMessage('Invalid login'),
  body('password')
    .trim()
    .isString()
    .isLength({ min: 6, max: 20 })
    .notEmpty()
    .withMessage('Invalid password'),
  body('email')
    .custom(async (i) => {
      const findUser = await userRepository.findByLoginOrEmail(i);
      if (findUser) {
        throw new Error('Invalid email');
      }
      return true;
    })
    .trim()
    .isString()
    .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
    .withMessage('Invalid email'),
];
export const AuthValidationEmail = () => [
  body('email')
    .custom(async (i) => {
      const user = await userRepository.findByLoginOrEmail(i);
      if (user!.emailConfirmation.isConfirmed === true)
        throw new Error('user is registered');
    })
    .trim()
    .isString()
    .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
    .withMessage('Invalid email'),
];
export const AuthValidationEmailToSendMessage = () => [
  body('email')
    .trim()
    .isString()
    .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
    .withMessage('Invalid email'),
];
export const AuthBodyToSendNewPassword = () => [
  body('newPassword')
    .trim()
    .isString()
    .isLength({ min: 6, max: 20 })
    .withMessage('Invalid newPassword'),
  body('recoveryCode')
    .custom(async (i) => {
      const user = await userRepository.findUserByCodeInValidation(i);
      if (!user) throw new Error('incorrect recoveryCode');
    })
    .trim()
    .isString()
    .withMessage('Invalid recoveryCode'),
];
